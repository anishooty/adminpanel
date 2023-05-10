import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import './UserTable.css';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editableFields, setEditableFields] = useState({});
    const entriesPerPage = 10;

    // Fetch users data from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Filter users based on search term
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle edit row
    const handleEditRow = (id) => {
        const userToEdit = users.find((user) => user.id === id);
        setEditableFields({ [id]: { name: userToEdit.name, email: userToEdit.email, role: userToEdit.role } });
    };

    // Handle edit field change
    const handleFieldChange = (id, field, value) => {
        setEditableFields((prevFields) => ({
            ...prevFields,
            [id]: {
                ...prevFields[id],
                [field]: value,
            },
        }));
    };

    // Handle save edited row
    const handleSaveRow = (id) => {
        const updatedUsers = users.map((user) => {
            if (user.id === id) {
                return {
                    ...user,
                    ...editableFields[id],
                };
            }
            return user;
        });
        setUsers(updatedUsers);
        setEditableFields({});
    };

    // Handle delete row
    const handleDeleteRow = (id) => {
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
    };

    // Handle delete selected rows
    const handleDeleteSelected = () => {
        const updatedUsers = users.filter((user) => !selectedRows.includes(user.id));
        setUsers(updatedUsers);
        setSelectedRows([]);
    };

    const toggleSelectRow = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const isRowSelected = (id) => selectedRows.includes(id);

    const handleSelectAll = () => {
        const allRowIds = currentUsers.map((user) => user.id);
        if (selectedRows.length === allRowIds.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(allRowIds);
        }
    };

    return (
        <div>
            <h2 className="header">Admin UI</h2>
            <div className="user-table">
                <input
                    type="text"
                    placeholder="Search by name, email or role"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === currentUsers.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.id} className={isRowSelected(user.id) ? 'selected-row' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={isRowSelected(user.id)}
                                        onChange={() => toggleSelectRow(user.id)}
                                    />
                                </td>
                                <td>{user.id}</td>
                                <td>
                                    {editableFields[user.id] ? (
                                        <input
                                            type="text"
                                            value={editableFields[user.id].name}
                                            onChange={(e) => handleFieldChange(user.id, 'name', e.target.value)}
                                        />
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td>
                                    {editableFields[user.id] ? (
                                        <input
                                            type="text"
                                            value={editableFields[user.id].email}
                                            onChange={(e) => handleFieldChange(user.id, 'email', e.target.value)}
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>
                                    {editableFields[user.id] ? (
                                        <input
                                            type="text"
                                            value={editableFields[user.id].role}
                                            onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}
                                        />
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td>
                                    <div className="actions">
                                        {editableFields[user.id] ? (
                                            <button className="save-button" onClick={() => handleSaveRow(user.id)}>
                                                Save
                                            </button>
                                        ) : (
                                            <button className="edit-button" onClick={() => handleEditRow(user.id)}>
                                                <FiEdit className="edit-icon" />
                                            </button>
                                        )}
                                        <button className="delete-button" onClick={() => handleDeleteRow(user.id)}>
                                            <FiTrash2 className="delete-icon" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="bottom-section">
                    <div className="delete-selected">
                        <button className="delete-selected-button" onClick={handleDeleteSelected}>
                            Delete Selected
                        </button>
                    </div>
                    <div className="pagination">
                        <button
                            className="pagination-button"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(1)}
                        >
                            &lt;&lt;
                        </button>
                        <button
                            className="pagination-button"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="pagination-button"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            &gt;
                        </button>
                        <button
                            className="pagination-button"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(totalPages)}
                        >
                            &gt;&gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTable;