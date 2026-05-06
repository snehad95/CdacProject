import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Trash2, Mail, Calendar, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user?.token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('http://localhost:5000/api/contact', config);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user?.token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      try {
        await axios.delete(`http://localhost:5000/api/contact/${id}`, config);
        setMessages(messages.filter((m) => m._id !== id));
        toast.success('Message deleted');
      } catch (err) {
        toast.error('Failed to delete message');
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">Contact Inquiries</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 border-0">Date</th>
              <th className="px-4 py-3 border-0">User</th>
              <th className="px-4 py-3 border-0">Subject</th>
              <th className="px-4 py-3 border-0">Message</th>
              <th className="px-4 py-3 border-0 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m._id} className="align-middle">
                <td className="px-4 py-3 border-0 text-muted small">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={14} /> {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 border-0">
                  <div className="fw-bold">{m.name}</div>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Mail size={12} /> {m.email}
                  </div>
                </td>
                <td className="px-4 py-3 border-0 fw-semibold text-primary">{m.subject}</td>
                <td className="px-4 py-3 border-0" style={{ maxWidth: '300px' }}>
                  <p className="mb-0 text-truncate" title={m.message}>{m.message}</p>
                </td>
                <td className="px-4 py-3 border-0 text-end">
                  <Button variant="outline-danger" size="sm" onClick={() => deleteHandler(m._id)} className="rounded-3">
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No messages found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ManageMessages;
