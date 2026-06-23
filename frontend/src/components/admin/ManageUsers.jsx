import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageUsers = ({ showOnlyStudents = false }) => {
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [filterExamId, setFilterExamId] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('http://localhost:5000/api/users', config);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const exRes = await axios.get('http://localhost:5000/api/exams');
      setExams(exRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDependencies();
  }, []);

  useEffect(() => {
    if(filterExamId) {
      axios.get(`http://localhost:5000/api/results/exam/${filterExamId}`).then(res => setResults(res.data));
    } else {
      setResults([]);
    }
  }, [filterExamId]);

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }, config);
      fetchUsers();
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        await axios.delete(`http://localhost:5000/api/users/${userId}`, config);
        fetchUsers();
        toast.success(`User "${userName}" deleted successfully`);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  // Filter logic
  let displayedUsers = users;
  
  if (showOnlyStudents) {
    displayedUsers = displayedUsers.filter(u => u.role === 'student');
  } else if (filterRole) {
    displayedUsers = displayedUsers.filter(u => u.role === filterRole);
  }

  if (filterExamId && results.length > 0) {
    const userIdsWhoTookExam = results.map(r => r.userId?._id?.toString());
    displayedUsers = displayedUsers.filter(u => userIdsWhoTookExam.includes(u._id.toString()));
  } else if (filterExamId && results.length === 0) {
    displayedUsers = [];
  }

  return (
    <div>
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            <Col md={4}>
              <h4 className="fw-bold mb-0" style={{ color: '#7c5cff' }}>{showOnlyStudents ? 'Student Registry' : 'User Registry'}</h4>
              <p className="text-muted small mb-0">{showOnlyStudents ? 'Track student activity and exam details' : 'Manage roles and track student activity'}</p>
            </Col>
            {!showOnlyStudents && (
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Filter By Role</Form.Label>
                <Form.Select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  <option value="">All Roles ({users.length})</option>
                  <option value="student">Students ({users.filter(u=>u.role==='student').length})</option>
                  <option value="teacher">Teachers ({users.filter(u=>u.role==='teacher').length})</option>
                  <option value="admin">Admins ({users.filter(u=>u.role==='admin').length})</option>
                </Form.Select>
              </Col>
            )}
            <Col md={showOnlyStudents ? 8 : 4}>
              <Form.Label className="small fw-bold text-muted">Filter By Exam Activity</Form.Label>
              <Form.Select value={filterExamId} onChange={e => setFilterExamId(e.target.value)}>
                <option value="">All Students</option>
                {exams.map(ex => <option key={ex._id} value={ex._id}>Taken: {ex.title}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

       <Table striped hover responsive className="bg-white shadow-sm border align-middle">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            {!showOnlyStudents && <th>Current Role</th>}
            {!showOnlyStudents && <th>Change Role</th>}
            {!showOnlyStudents && <th className="text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map(user => (
            <tr key={user._id}>
              <td className="fw-semibold">{user.name}</td>
              <td>{user.email}</td>
              {!showOnlyStudents && (
                <td>
                  <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'warning text-dark' : 'success'}>
                    {user.role.toUpperCase()}
                  </Badge>
                </td>
              )}
              {!showOnlyStudents && (
                <td>
                  <Form.Select size="sm" value={user.role} onChange={(e) => handleChangeRole(user._id, e.target.value)} style={{ width: '150px' }}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </td>
              )}
              {!showOnlyStudents && (
                <td className="text-center">
                  <Button
                    variant="link"
                    className="text-danger p-0 shadow-none hover-scale"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    title="Remove User"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              )}
            </tr>
          ))}
          {displayedUsers.length === 0 && (
            <tr><td colSpan={showOnlyStudents ? 2 : 5} className="text-center py-4 text-muted">No users found.</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ManageUsers;
