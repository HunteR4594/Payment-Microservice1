/**
 * Mock refund request data
 * Moved outside component to prevent re-creation on every render
 */
export const initialRefunds = [
  {
    id: '206MCU',
    ticketNumber: '206MCU',
    name: 'Tony Stark',
    issueType: 'Incorrect ordered item(s)',
    dateSubmitted: '2026-01-15',
    status: 'approved',
    description: 'Customer received wrong items in their order.',
    photo: 'https://via.placeholder.com/300x200',
    orderDetails: {
      items: [
        { id: 1, name: 'Vanibara Frappe', price: 25.00, quantity: 2 },
        { id: 2, name: 'Coffeebara Latte', price: 15.00, quantity: 1 }
      ],
      total: 65.00
    },
    customer: {
      name: 'Tony Stark',
      email: 'tony.stark@example.com',
      phoneNumber: '+1 (555) 123-4567'
    }
  },
  {
    id: '123ABC',
    ticketNumber: '123ABC',
    name: 'John Dole',
    issueType: 'Damaged Order',
    dateSubmitted: '2026-01-20',
    status: 'pending',
    description: 'Package arrived with visible damage to contents.',
    photo: 'https://via.placeholder.com/300x200',
    orderDetails: {
      items: [
        { id: 1, name: 'Classic Berrybara Latte', price: 89.99, quantity: 1 },
        { id: 2, name: 'Chickenbara Nori Bowl', price: 19.99, quantity: 3 }
      ],
      total: 149.96
    },
    customer: {
      name: 'John Dole',
      email: 'john.dole@example.com',
      phoneNumber: '+1 (555) 987-6543'
    }
  }
];

