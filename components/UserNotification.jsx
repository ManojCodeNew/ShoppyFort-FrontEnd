import React, { useState } from 'react';
import { Container, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import notification from '../assets/Images/notification.png';
import { useUserNotifications } from '@/contexts/UserNotificationContext';

const UserNotifications = () => {
    const { notifications, setNotifications } = useUserNotifications();
    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
        );

    };
    console.log("Notifications", notifications);


    return (
        <Container className="mt-4" style={{ backgroundColor: '#F5F7FA', padding: '20px', borderRadius: '8px' }}>
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <div className="d-flex align-items-center mb-4">
                        <img src={notification} alt="Notification Icon" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                        <h2 className="m-0 text-success">Notifications</h2>
                    </div>
                    <ListGroup>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <ListGroup.Item
                                    key={notification._id}
                                    className={`d-flex justify-content-between align-items-center ${notification.read ? 'text-muted' : 'text-dark'}`}
                                    onClick={() => markAsRead(notification._id)}
                                    style={{ backgroundColor: notification.read ? '#E9ECEF' : '#FFFFFF', border: '1px solid #28a745', borderRadius: '5px', marginBottom: '8px', cursor: 'pointer' }}
                                >
                                    <div>

                                        <p className="mb-1">Use OTP <b>{notification.otp}</b> to receive your order <b>{notification.orderid}</b>. Don't share it with anyone! 🔐</p>
                                        <small className="text-muted">{notification.timeAgo}</small>
                                    </div>
                                    {!notification.read && <Badge bg="success">New</Badge>}
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p className="text-muted text-center">No new notifications</p>
                        )}
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default UserNotifications;
