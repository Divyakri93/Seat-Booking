const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Seat = require('./models/Seat');
const Schedule = require('./models/Schedule');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Seat.deleteMany();
        await Schedule.deleteMany();
        console.log('Cleared existing data.');

        // 1. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Admin User',
            email: 'admin@company.com',
            password: adminPassword,
            employeeId: 'ADM001',
            batch: 1,
            squad: 1,
            role: 'admin'
        });
        console.log('Admin user created.');

        // 2. Create 80 Employees (8 squads × 10 members)
        const employees = [];
        const empPassword = await bcrypt.hash('password123', salt);

        for (let s = 1; s <= 8; s++) {
            const batch = s <= 4 ? 1 : 2; // Squad 1-4 -> Batch 1, Squad 5-8 -> Batch 2
            for (let e = 1; e <= 10; e++) {
                employees.push({
                    name: `Employee S${s} E${e}`,
                    email: `emp.s${s}.e${e}@company.com`,
                    password: empPassword,
                    employeeId: `EMP${s}${e.toString().padStart(2, '0')}`,
                    batch: batch,
                    squad: s,
                    role: 'employee'
                });
            }
        }
        await User.insertMany(employees);
        console.log('80 employees created across 8 squads.');

        // 3. Create 50 Seats (40 designated + 10 floating)
        const seats = [];

        // 40 Designated Seats
        for (let i = 1; i <= 40; i++) {
            seats.push({
                seatNumber: `D-${i.toString().padStart(2, '0')}`,
                seatType: 'designated',
                isActive: true
            });
        }

        // 10 Floating Seats
        for (let i = 1; i <= 10; i++) {
            seats.push({
                seatNumber: `F-${i.toString().padStart(2, '0')}`,
                seatType: 'floating',
                isActive: true
            });
        }

        await Seat.insertMany(seats);
        console.log('50 seats created (40 designated, 10 floating).');

        // 4. Create Basic Schedule for current week
        const d = new Date();
        const weekNum = Math.ceil(d.getDate() / 7); // Rough week number

        await Schedule.create({
            weekNumber: weekNum,
            weekStartDate: new Date(),
            batch1Days: ['Monday', 'Tuesday', 'Wednesday'],
            batch2Days: ['Thursday', 'Friday'],
            isTeamDay: false,
            extraFloatingSeats: 0
        });

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
