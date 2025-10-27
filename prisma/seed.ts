import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qtec.com' },
    update: {},
    create: {
      email: 'admin@qtec.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      employeeId: 'QTEC-ADMIN-001',
      department: 'Management',
      position: 'System Administrator',
      role: UserRole.ADMIN,
      location: 'Dhaka, Bangladesh',
      bio: 'System administrator for QSL AI Hackathon platform',
      skills: ['System Administration', 'Database Management', 'Security'],
    },
  })

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@qtec.com' },
    update: {},
    create: {
      email: 'user@qtec.com',
      password: userPassword,
      firstName: 'Ahmed',
      lastName: 'Khan',
      employeeId: 'QTEC-2024-001',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      role: UserRole.USER,
      location: 'Dhaka, Bangladesh',
      bio: 'Passionate about AI and machine learning. Love building innovative solutions that make a difference.',
      skills: ['Python', 'React', 'Node.js', 'Machine Learning', 'AI'],
    },
  })

  // Create some demo ideas
  await prisma.idea.createMany({
    data: [
      {
        title: 'AI-Powered Inventory Management',
        description: 'An intelligent system that predicts inventory needs using machine learning algorithms',
        category: 'Business Intelligence',
        problemStatement: 'Manual inventory management leads to stockouts and overstocking, causing financial losses',
        solution: 'AI system that analyzes sales patterns, seasonality, and external factors to predict optimal inventory levels',
        targetAudience: 'Retail businesses and warehouses',
        techStack: ['Python', 'TensorFlow', 'React', 'Node.js'],
        expectedOutcome: 'Reduced inventory costs by 20% and eliminated stockouts',
        timeline: '5-6 weeks',
        resources: 'ML expertise, cloud computing resources',
        status: 'APPROVED',
        progress: 75,
        score: 8.5,
        feedback: 'Great idea! The concept is solid and the technical approach is well thought out.',
        githubUrl: 'https://github.com/ahmed/inventory-ai',
        demoUrl: 'https://inventory-ai-demo.com',
        userId: user.id,
      },
      {
        title: 'Smart Customer Support Bot',
        description: 'AI chatbot that provides instant customer support with natural language processing',
        category: 'Customer Service',
        problemStatement: 'Customer support teams are overwhelmed with repetitive queries',
        solution: 'AI-powered chatbot that can handle common queries and escalate complex issues to humans',
        targetAudience: 'E-commerce and service companies',
        techStack: ['OpenAI API', 'React', 'Express'],
        expectedOutcome: 'Reduced support ticket volume by 60%',
        timeline: '4-5 weeks',
        resources: 'OpenAI API access, web development skills',
        status: 'PENDING',
        progress: 30,
        userId: user.id,
      },
    ],
  })

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Welcome to QSL AI Hackathon!',
        message: 'Welcome to the QSL AI Hackathon platform. Start by submitting your innovative project idea.',
        type: 'info',
        userId: user.id,
      },
      {
        title: 'Idea Approved',
        message: 'Your AI-Powered Inventory Management idea has been approved! You can now start development.',
        type: 'success',
        userId: user.id,
      },
      {
        title: 'Workshop Reminder',
        message: 'AI Tools Workshop is scheduled for tomorrow at 2:00 PM. Don\'t miss it!',
        type: 'info',
        userId: user.id,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user:', admin.email)
  console.log('👤 Demo user:', user.email)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
