import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaFilter } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../../redux/slices/adminSlice';
import './AdminFinancial.css';

const AdminFinancial = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { transactions, isLoading, error } = useSelector(state => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    if (token) {
      dispatch(fetchTransactions(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Calculate totals from transactions
      const totals = transactions.reduce((acc, transaction) => {
        if (transaction.status === 'completed') {
          acc.revenue += transaction.amount;
          acc.commission += transaction.commission || 0;
        }
        return acc;
      }, { revenue: 0, commission: 0 });

      setTotalRevenue(totals.revenue);
      setTotalCommission(totals.commission);
    }
  }, [transactions]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('/api/v1/payments/admin/transactions/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;

    let matchesDate = true;
    if (filterDate !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      switch (filterDate) {
        case 'today':
          matchesDate = transactionDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDate = transactionDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          matchesDate = transactionDate >= lastWeek;
          break;
        case 'month':
          matchesDate = transactionDate >= lastMonth;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  if (!token) {
    return (
      <div className="admin-financial-page">
        <div className="error-message">
          <h3>Authentication Required</h3>
          <p>You need to be logged in as an admin to access this page.</p>
          <button onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="admin-loading">Loading financial data...</div>;
  }

  if (error) {
    return (
      <div className="admin-financial-page">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchTransactions(token))}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-financial-page">
      <div className="admin-page-header">
        <h1>Financial Management</h1>
        <p>View and manage financial transactions</p>
      </div>

      <div className="financial-summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="amount">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Commission</h3>
          <p className="amount">Rs. {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="date-filter">Date Range</label>
            <select
              id="date-filter"
              value={filterDate}
              onChange={handleFilterDateChange}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="type-filter">Transaction Type</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <option value="all">All Types</option>
              <option value="order">Order Payment</option>
              <option value="refund">Refund</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={handleFilterStatusChange}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by user, restaurant or order ID"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <button className="download-btn" onClick={handleDownloadReport}>
          <FaDownload /> Download Report
        </button>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>User</th>
              <th>Restaurant</th>
              <th>Order ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="transaction-type">
                    {transaction.type === 'order' ? 'Order Payment' : 
                     transaction.type === 'refund' ? 'Refund' : 
                     transaction.type === 'subscription' ? 'Subscription' : 
                     transaction.type}
                  </td>
                  <td className="transaction-amount">
                    Rs. {transaction.amount.toFixed(2)}
                  </td>
                  <td>{transaction.user ? `${transaction.user.name} (${transaction.user.email})` : 'N/A'}</td>
                  <td>{transaction.restaurant ? transaction.restaurant.name : 'N/A'}</td>
                  <td>{transaction.orderId}</td>
                  <td>
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinancial;