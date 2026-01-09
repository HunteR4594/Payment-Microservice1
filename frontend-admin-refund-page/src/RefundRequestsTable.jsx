import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { getStatusBadge } from './utils/statusBadges';

const RefundRequestsTable = ({ refundRequests, onReviewClick }) => {
  return (
    <div className="refund-requests-table w-100">
      <div className="table-responsive">
        <Table hover className="glassmorphism-table w-100">
          <thead>
            <tr>
              <th>Ticket No.</th>
              <th>Name</th>
              <th>Issue Type</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {refundRequests.map((request) => (
              <tr key={request.id}>
                <td className="fw-semibold">{request.ticketNumber}</td>
                <td>{request.name}</td>
                <td>{request.issueType}</td>
                <td>
                  {new Date(request.dateSubmitted).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td>{getStatusBadge(request.status)}</td>
                <td>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => onReviewClick(request)}
                    className="custom-brown-btn"
                  >
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RefundRequestsTable;