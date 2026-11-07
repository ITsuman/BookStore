// ─── Demo users & saved addresses ─────────────────────────────────────────

export const demoUsers = [
  {
    id: "u1",
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "password123",
    avatar: "PS",
    giftPoints: 250,
    addresses: [
      {
        id: "a1",
        label: "Home",
        firstName: "Priya",
        lastName: "Sharma",
        address1: "42, MG Road",
        address2: "Apt 3B",
        city: "Bengaluru",
        pin: "560001",
        state: "Karnataka",
        country: "India",
        phone: "+91 98765 43210",
        email: "priya@example.com",
      },
    ],
    orderHistory: [
      { orderId: "ORD-2001", bookId: 1, quantity: 1, price: 399, date: "2026-09-15", status: "Delivered" },
      { orderId: "ORD-2002", bookId: 3, quantity: 1, price: 359, date: "2026-10-02", status: "Delivered" },
      { orderId: "ORD-2003", bookId: 7, quantity: 2, price: 298, date: "2026-10-20", status: "Delivered" },
    ],
  },
  {
    id: "u2",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: "pass456",
    avatar: "AM",
    giftPoints: 80,
    addresses: [
      {
        id: "a2",
        label: "Office",
        firstName: "Arjun",
        lastName: "Mehta",
        address1: "10, Nariman Point",
        address2: "",
        city: "Mumbai",
        pin: "400021",
        state: "Maharashtra",
        country: "India",
        phone: "+91 91234 56789",
        email: "arjun@example.com",
      },
    ],
    orderHistory: [
      { orderId: "ORD-3001", bookId: 4, quantity: 1, price: 299, date: "2026-08-10", status: "Delivered" },
      { orderId: "ORD-3002", bookId: 6, quantity: 1, price: 359, date: "2026-09-28", status: "Delivered" },
    ],
  },
];
