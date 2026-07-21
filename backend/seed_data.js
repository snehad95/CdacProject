import mongoose from 'mongoose';
import PracticeTest from './models/PracticeTest.js';
import Exam from './models/Exam.js';
import Question from './models/Question.js';
import dotenv from 'dotenv';
import { generate100Questions } from './utils/questionGenerator.js';

dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';
const adminId = '69e5e511121880e77769316f'; 

const practiceTestTemplates = [
  {
    title: 'Programming',
    description: 'Test coding knowledge in different programming languages.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which of the following is not a programming language?',
        options: [
          { text: 'HTML', isCorrect: true },
          { text: 'Java', isCorrect: false },
          { text: 'Python', isCorrect: false },
          { text: 'C++', isCorrect: false }
        ]
      },
      {
        text: 'What does HTML stand for?',
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true },
          { text: 'High Tech Markup Language', isCorrect: false },
          { text: 'Hyper Tabular Markup Language', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ]
      },
      {
        text: 'What is the entry point function in a standard C++ program?',
        options: [
          { text: 'start()', isCorrect: false },
          { text: 'main()', isCorrect: true },
          { text: 'entry()', isCorrect: false },
          { text: 'run()', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Quantitative Aptitude',
    description: 'Improve mathematical and logical problem solving skills.',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What is the square root of 144?',
        options: [
          { text: '10', isCorrect: false },
          { text: '11', isCorrect: false },
          { text: '12', isCorrect: true },
          { text: '13', isCorrect: false }
        ]
      },
      {
        text: 'If 5x + 3 = 18, what is the value of x?',
        options: [
          { text: '2', isCorrect: false },
          { text: '3', isCorrect: true },
          { text: '4', isCorrect: false },
          { text: '5', isCorrect: false }
        ]
      },
      {
        text: 'What is 15% of 200?',
        options: [
          { text: '15', isCorrect: false },
          { text: '30', isCorrect: true },
          { text: '45', isCorrect: false },
          { text: '60', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Logical Reasoning',
    description: 'Develop analytical and thinking ability.',
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'If A is B\'s brother, and B is C\'s sister, what is A to C?',
        options: [
          { text: 'Brother', isCorrect: true },
          { text: 'Sister', isCorrect: false },
          { text: 'Father', isCorrect: false },
          { text: 'Mother', isCorrect: false }
        ]
      },
      {
        text: 'Which number comes next in the sequence: 2, 4, 8, 16, ...?',
        options: [
          { text: '20', isCorrect: false },
          { text: '24', isCorrect: false },
          { text: '32', isCorrect: true },
          { text: '64', isCorrect: false }
        ]
      },
      {
        text: 'Find the odd one out from the options below.',
        options: [
          { text: 'Apple', isCorrect: false },
          { text: 'Banana', isCorrect: false },
          { text: 'Carrot', isCorrect: true },
          { text: 'Grape', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'English',
    description: 'Practice grammar, vocabulary and comprehension.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Identify the antonym of \'Generous\'.',
        options: [
          { text: 'Kind', isCorrect: false },
          { text: 'Greedy', isCorrect: false },
          { text: 'Selfish', isCorrect: true },
          { text: 'Cruel', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following is a noun?',
        options: [
          { text: 'Run', isCorrect: false },
          { text: 'Beautiful', isCorrect: false },
          { text: 'Quickly', isCorrect: false },
          { text: 'Elephant', isCorrect: true }
        ]
      },
      {
        text: 'Choose the correct spelling from the options.',
        options: [
          { text: 'Receve', isCorrect: false },
          { text: 'Receive', isCorrect: true },
          { text: 'Recieve', isCorrect: false },
          { text: 'Receeve', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'General Knowledge',
    description: 'Stay updated with current affairs and general awareness.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which is the largest ocean on Earth?',
        options: [
          { text: 'Atlantic Ocean', isCorrect: false },
          { text: 'Indian Ocean', isCorrect: false },
          { text: 'Pacific Ocean', isCorrect: true },
          { text: 'Arctic Ocean', isCorrect: false }
        ]
      },
      {
        text: 'Who is known as the Father of the Nation in India?',
        options: [
          { text: 'Mahatma Gandhi', isCorrect: true },
          { text: 'Jawaharlal Nehru', isCorrect: false },
          { text: 'Subhas Chandra Bose', isCorrect: false },
          { text: 'B.R. Ambedkar', isCorrect: false }
        ]
      },
      {
        text: 'What is the capital city of France?',
        options: [
          { text: 'London', isCorrect: false },
          { text: 'Rome', isCorrect: false },
          { text: 'Berlin', isCorrect: false },
          { text: 'Paris', isCorrect: true }
        ]
      }
    ]
  },
  {
    title: 'Technical Subjects',
    description: 'Prepare technical concepts for placements and exams.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What is the primary function of an ALU in a computer processor?',
        options: [
          { text: 'Perform arithmetic and logical operations', isCorrect: true },
          { text: 'Store permanent user data', isCorrect: false },
          { text: 'Route packets in network', isCorrect: false },
          { text: 'Control visual output interfaces', isCorrect: false }
        ]
      },
      {
        text: 'What does RAM stand for in computer hardware?',
        options: [
          { text: 'Random Access Memory', isCorrect: true },
          { text: 'Read And Memory', isCorrect: false },
          { text: 'Run Access Method', isCorrect: false },
          { text: 'Real-time Active Memory', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following devices is purely an input device?',
        options: [
          { text: 'Monitor', isCorrect: false },
          { text: 'Printer', isCorrect: false },
          { text: 'Keyboard', isCorrect: true },
          { text: 'Speaker', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Data Structures',
    description: 'Master arrays, trees, graphs, and algorithm complexity.',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which data structure is based on the FIFO (First In First Out) principle?',
        options: [
          { text: 'Stack', isCorrect: false },
          { text: 'Queue', isCorrect: true },
          { text: 'Tree', isCorrect: false },
          { text: 'Heap', isCorrect: false }
        ]
      },
      {
        text: 'What is the average time complexity of searching in a Balanced Binary Search Tree (BST)?',
        options: [
          { text: 'O(1)', isCorrect: false },
          { text: 'O(log n)', isCorrect: true },
          { text: 'O(n)', isCorrect: false },
          { text: 'O(n log n)', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following is a non-linear data structure?',
        options: [
          { text: 'Array', isCorrect: false },
          { text: 'Linked List', isCorrect: false },
          { text: 'Stack', isCorrect: false },
          { text: 'Graph', isCorrect: true }
        ]
      }
    ]
  },
  {
    title: 'Database Management',
    description: 'SQL, NoSQL, normalization, and query optimization.',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What does SQL stand for?',
        options: [
          { text: 'Structured Query Language', isCorrect: true },
          { text: 'Simple Query Language', isCorrect: false },
          { text: 'Sequential Query Language', isCorrect: false },
          { text: 'Standard Query Language', isCorrect: false }
        ]
      },
      {
        text: 'Which key is used to uniquely identify a record in a database table?',
        options: [
          { text: 'Foreign Key', isCorrect: false },
          { text: 'Primary Key', isCorrect: true },
          { text: 'Unique Key', isCorrect: false },
          { text: 'Super Key', isCorrect: false }
        ]
      },
      {
        text: 'What does ACID stand for in DBMS transactions?',
        options: [
          { text: 'Atomicity Consistency Isolation Durability', isCorrect: true },
          { text: 'Atomicity Concurrency Integrity Durability', isCorrect: false },
          { text: 'Access Control Integrity Database', isCorrect: false },
          { text: 'Active Consistency Isolated Database', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Operating Systems',
    description: 'Processes, memory management, scheduling and more.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What is a deadlock in an Operating System?',
        options: [
          { text: 'A process that runs in an infinite loop', isCorrect: false },
          { text: 'A state where processes are blocked waiting for resources held by each other', isCorrect: true },
          { text: 'A sudden system crash due to power failure', isCorrect: false },
          { text: 'A hard disk read failure error', isCorrect: false }
        ]
      },
      {
        text: 'Which scheduling algorithm can cause starvation for longer processes?',
        options: [
          { text: 'Round Robin', isCorrect: false },
          { text: 'First Come First Served', isCorrect: false },
          { text: 'Shortest Job First', isCorrect: true },
          { text: 'None of the above', isCorrect: false }
        ]
      },
      {
        text: 'What is virtual memory?',
        options: [
          { text: 'An extra physical RAM stick inserted manually', isCorrect: false },
          { text: 'A technique that allows execution of processes larger than physical RAM', isCorrect: true },
          { text: 'A backup cloud storage space', isCorrect: false },
          { text: 'A software emulator simulating CPUs', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Computer Networks',
    description: 'TCP/IP, OSI model, routing and network security concepts.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which layer of the OSI model is responsible for routing packets across networks?',
        options: [
          { text: 'Physical Layer', isCorrect: false },
          { text: 'Data Link Layer', isCorrect: false },
          { text: 'Network Layer', isCorrect: true },
          { text: 'Transport Layer', isCorrect: false }
        ]
      },
      {
        text: 'What is the default port number used for standard unencrypted HTTP traffic?',
        options: [
          { text: '21', isCorrect: false },
          { text: '22', isCorrect: false },
          { text: '80', isCorrect: true },
          { text: '443', isCorrect: false }
        ]
      },
      {
        text: 'What does DNS stand for in networking?',
        options: [
          { text: 'Domain Name System', isCorrect: true },
          { text: 'Dynamic Network System', isCorrect: false },
          { text: 'Digital Name Service', isCorrect: false },
          { text: 'Domain Network Server', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Software Engineering',
    description: 'SDLC, design patterns, testing, and agile methodologies.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What is typically the first phase of the Software Development Life Cycle (SDLC)?',
        options: [
          { text: 'Coding', isCorrect: false },
          { text: 'Testing', isCorrect: false },
          { text: 'Design', isCorrect: false },
          { text: 'Requirements Gathering & Analysis', isCorrect: true }
        ]
      },
      {
        text: 'What is Git?',
        options: [
          { text: 'A compiler for code compilation', isCorrect: false },
          { text: 'A web page editor', isCorrect: false },
          { text: 'A distributed version control system', isCorrect: true },
          { text: 'A database hosting engine', isCorrect: false }
        ]
      },
      {
        text: 'Which creational design pattern ensures a class has only one instance worldwide?',
        options: [
          { text: 'Factory Pattern', isCorrect: false },
          { text: 'Singleton Pattern', isCorrect: true },
          { text: 'Observer Pattern', isCorrect: false },
          { text: 'Strategy Pattern', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Cybersecurity',
    description: 'Encryption, ethical hacking, firewalls and threat analysis.',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What does HTTPS stand for?',
        options: [
          { text: 'Hyper Text Transfer Protocol Secure', isCorrect: true },
          { text: 'Hyper Transfer Protocol Standard', isCorrect: false },
          { text: 'High Technology Protection System', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ]
      },
      {
        text: 'What is phishing in cyber security?',
        options: [
          { text: 'A network bandwidth optimization tool', isCorrect: false },
          { text: 'An attempt to obtain sensitive info via deceptive emails/messages', isCorrect: true },
          { text: 'A method of writing safe code compiled on servers', isCorrect: false },
          { text: 'A type of physical secure network hardware firewall', isCorrect: false }
        ]
      },
      {
        text: 'What is the main purpose of a network Firewall?',
        options: [
          { text: 'To speed up internet connectivity', isCorrect: false },
          { text: 'To monitor and filter incoming and outgoing network traffic', isCorrect: true },
          { text: 'To encrypt local storage files', isCorrect: false },
          { text: 'To backup server files', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Artificial Intelligence',
    description: 'AI fundamentals, search algorithms, and knowledge representation.',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Who is widely considered the Father of Artificial Intelligence?',
        options: [
          { text: 'Alan Turing', isCorrect: false },
          { text: 'John McCarthy', isCorrect: true },
          { text: 'Marvin Minsky', isCorrect: false },
          { text: 'Elon Musk', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following search algorithms is heuristic-based?',
        options: [
          { text: 'Breadth First Search', isCorrect: false },
          { text: 'Depth First Search', isCorrect: false },
          { text: 'A* Search', isCorrect: true },
          { text: 'Dijkstra\'s Algorithm', isCorrect: false }
        ]
      },
      {
        text: 'What does NLP stand for in Artificial Intelligence context?',
        options: [
          { text: 'Natural Language Processing', isCorrect: true },
          { text: 'Network Layer Protocol', isCorrect: false },
          { text: 'Neural Logical Programming', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Machine Learning',
    description: 'Supervised, unsupervised learning and model evaluation.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which of the following is a supervised learning algorithm?',
        options: [
          { text: 'K-Means Clustering', isCorrect: false },
          { text: 'Linear Regression', isCorrect: true },
          { text: 'Principal Component Analysis (PCA)', isCorrect: false },
          { text: 'Apriori Algorithm', isCorrect: false }
        ]
      },
      {
        text: 'What is overfitting in machine learning models?',
        options: [
          { text: 'A model performing well on training but poorly on unseen test data', isCorrect: true },
          { text: 'A model that is too simple to capture patterns', isCorrect: false },
          { text: 'A model with extremely high bias', isCorrect: false },
          { text: 'A model that compiles extremely fast', isCorrect: false }
        ]
      },
      {
        text: 'What does a neural network layer primarily optimize during backpropagation?',
        options: [
          { text: 'Hyperparameters', isCorrect: false },
          { text: 'Weights and biases', isCorrect: true },
          { text: 'Database query speed', isCorrect: false },
          { text: 'Compiler flags', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Web Development',
    description: 'HTML, CSS, JavaScript, REST APIs and frontend frameworks.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which language is used to write stylesheets for formatting web pages?',
        options: [
          { text: 'HTML', isCorrect: false },
          { text: 'CSS', isCorrect: true },
          { text: 'JavaScript', isCorrect: false },
          { text: 'SQL', isCorrect: false }
        ]
      },
      {
        text: 'What is the main purpose of React.js?',
        options: [
          { text: 'Managing backend server databases', isCorrect: false },
          { text: 'Writing query scripts', isCorrect: false },
          { text: 'Building interactive and responsive user interfaces', isCorrect: true },
          { text: 'Running operating system services', isCorrect: false }
        ]
      },
      {
        text: 'Which HTTP status code represents \'Page Not Found\' error?',
        options: [
          { text: '200', isCorrect: false },
          { text: '301', isCorrect: false },
          { text: '400', isCorrect: false },
          { text: '404', isCorrect: true }
        ]
      }
    ]
  },
  {
    title: 'Cloud Computing',
    description: 'AWS, Azure, GCP — deployment, storage and cloud architecture.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which of the following is a cloud computing service model?',
        options: [
          { text: 'IaaS (Infrastructure as a Service)', isCorrect: false },
          { text: 'SaaS (Software as a Service)', isCorrect: false },
          { text: 'PaaS (Platform as a Service)', isCorrect: false },
          { text: 'All of the above', isCorrect: true }
        ]
      },
      {
        text: 'Which AWS service is designed for scalable object storage?',
        options: [
          { text: 'Amazon EC2', isCorrect: false },
          { text: 'Amazon S3', isCorrect: true },
          { text: 'Amazon RDS', isCorrect: false },
          { text: 'AWS Lambda', isCorrect: false }
        ]
      },
      {
        text: 'What is serverless computing?',
        options: [
          { text: 'Computing using absolutely no physical servers anywhere', isCorrect: false },
          { text: 'A model where cloud provider manages servers dynamically and runs code', isCorrect: true },
          { text: 'Running apps exclusively on localized user machines', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Mobile Development',
    description: 'Android, iOS fundamentals and cross-platform app building.',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which programming language is Google\'s primary choice for native Android development?',
        options: [
          { text: 'Swift', isCorrect: false },
          { text: 'Kotlin', isCorrect: true },
          { text: 'Python', isCorrect: false },
          { text: 'C#', isCorrect: false }
        ]
      },
      {
        text: 'What is Flutter?',
        options: [
          { text: 'A backend database system', isCorrect: false },
          { text: 'An open-source UI SDK created by Google for cross-platform apps', isCorrect: true },
          { text: 'A compiler for desktop applications', isCorrect: false },
          { text: 'An operating system kernel', isCorrect: false }
        ]
      },
      {
        text: 'Which language is used for native iOS development in modern Apple environments?',
        options: [
          { text: 'Swift', isCorrect: true },
          { text: 'Java', isCorrect: false },
          { text: 'Kotlin', isCorrect: false },
          { text: 'PHP', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'DevOps & CI/CD',
    description: 'Docker, Kubernetes, pipelines and continuous integration.',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'What does CI/CD stand for in software engineering?',
        options: [
          { text: 'Continuous Integration / Continuous Deployment', isCorrect: true },
          { text: 'Continuous Internet / Cloud Delivery', isCorrect: false },
          { text: 'Computer Interface / Cloud Database', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ]
      },
      {
        text: 'What is Docker primarily used for?',
        options: [
          { text: 'Writing programming code', isCorrect: false },
          { text: 'Creating and managing application containers', isCorrect: true },
          { text: 'Running security penetration tests', isCorrect: false },
          { text: 'Editing video and image files', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following tools is popular for automating CI/CD pipelines?',
        options: [
          { text: 'Jenkins', isCorrect: true },
          { text: 'React', isCorrect: false },
          { text: 'MongoDB', isCorrect: false },
          { text: 'VS Code', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Computer Fundamentals',
    description: 'Test your basic knowledge of computer hardware and software.',
    image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=500',
    questions: [
      {
        text: 'Which of the following is the brain of a computer system?',
        options: [
          { text: 'RAM', isCorrect: false },
          { text: 'Hard Disk', isCorrect: false },
          { text: 'CPU', isCorrect: true },
          { text: 'GPU', isCorrect: false }
        ]
      },
      {
        text: 'What is the binary representation of decimal number 10?',
        options: [
          { text: '1001', isCorrect: false },
          { text: '1010', isCorrect: true },
          { text: '1100', isCorrect: false },
          { text: '1111', isCorrect: false }
        ]
      },
      {
        text: 'Which of the following is an example of system software?',
        options: [
          { text: 'Microsoft Word', isCorrect: false },
          { text: 'Google Chrome', isCorrect: false },
          { text: 'Operating System', isCorrect: true },
          { text: 'Photoshop', isCorrect: false }
        ]
      }
    ]
  }
];

export const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(CONNECTION_URL);
    }
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Practice Tests and Questions
    await PracticeTest.deleteMany({});
    console.log('🗑️ Cleared existing practice tests.');
    
    // Also clear associated practice test questions to rebuild them clean
    await Question.deleteMany({ practiceTestId: { $exists: true } });
    console.log('🗑️ Cleared existing practice test questions.');

    const allCategories = [
      { title: 'Programming', desc: 'Test coding knowledge in different programming languages.', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=500' },
      { title: 'Quantitative Aptitude', desc: 'Improve mathematical and logical problem solving skills.', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=500' },
      { title: 'Logical Reasoning', desc: 'Develop analytical and thinking ability.', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=500' },
      { title: 'English', desc: 'Practice grammar, vocabulary and comprehension.', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500' },
      { title: 'General Knowledge', desc: 'Stay updated with current affairs and general awareness.', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=500' },
      { title: 'Technical Subjects', desc: 'Prepare technical concepts for placements and exams.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
      { title: 'Data Structures', desc: 'Master arrays, trees, graphs, and algorithm complexity.', img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=500' },
      { title: 'Database Management', desc: 'SQL, NoSQL, normalization, and query optimization.', img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=500' },
      { title: 'Operating Systems', desc: 'Processes, memory management, scheduling and more.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500' },
      { title: 'Computer Networks', desc: 'TCP/IP, OSI model, routing and network security concepts.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=500' },
      { title: 'Software Engineering', desc: 'SDLC, design patterns, testing, and agile methodologies.', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500' },
      { title: 'Cybersecurity', desc: 'Encryption, ethical hacking, firewalls and threat analysis.', img: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=500' },
      { title: 'Artificial Intelligence', desc: 'AI fundamentals, search algorithms, and knowledge representation.', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=500' },
      { title: 'Machine Learning', desc: 'Supervised, unsupervised learning and model evaluation.', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500' },
      { title: 'Web Development', desc: 'HTML, CSS, JavaScript, REST APIs and frontend frameworks.', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=500' },
      { title: 'Cloud Computing', desc: 'AWS, Azure, GCP — deployment, storage and cloud architecture.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500' },
      { title: 'Mobile Development', desc: 'Android, iOS fundamentals and cross-platform app building.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500' },
      { title: 'DevOps & CI/CD', desc: 'Docker, Kubernetes, pipelines and continuous integration.', img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=500' }
    ];

    for (const cat of allCategories) {
      const test = new PracticeTest({
        title: cat.title,
        description: cat.desc,
        image: cat.img,
        createdBy: adminId
      });
      const savedTest = await test.save();

      const questionsToInsert = generate100Questions(savedTest.title, savedTest._id, adminId);
      await Question.insertMany(questionsToInsert);
    }
    console.log(`✅ Seeded ${allCategories.length} Practice Tests with 100 questions each (Total: ${allCategories.length * 100} questions).`);

    // 2. Seed Exams
    const exams = [
      {
        title: 'CDAC Entrance Exam 2026',
        category: 'Entrance',
        description: 'Entrance examination for C-DAC Post Graduate Diploma courses.',
        startTime: new Date('2026-05-10T10:00:00'),
        endTime: new Date('2026-05-10T13:00:00'),
        durationMinutes: 180,
        passingScore: 40,
        totalMarks: 3,
        resultsPublished: false,
        createdBy: adminId
      }
    ];

    await Exam.deleteMany({});
    const createdExams = await Exam.insertMany(exams);
    console.log('✅ Seeded Exams');

    // 3. Seed Questions for the Exam
    const examId = createdExams[0]._id;
    const questions = [
      {
        examId,
        text: 'What is the correct way to declare a constant in JavaScript?',
        options: [
          { text: 'var x = 10;', isCorrect: false },
          { text: 'let x = 10;', isCorrect: false },
          { text: 'const x = 10;', isCorrect: true },
          { text: 'constant x = 10;', isCorrect: false }
        ],
        createdBy: adminId
      },
      {
        examId,
        text: 'Which data structure follows the LIFO (Last In First Out) principle?',
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Linked List', isCorrect: false },
          { text: 'Tree', isCorrect: false }
        ],
        createdBy: adminId
      },
      {
        examId,
        text: 'Identify the protocol used for secure web communication.',
        options: [
          { text: 'HTTP', isCorrect: false },
          { text: 'FTP', isCorrect: false },
          { text: 'HTTPS', isCorrect: true },
          { text: 'SMTP', isCorrect: false }
        ],
        createdBy: adminId
      }
    ];

    await Question.deleteMany({ examId }); // Only delete questions for this seeded exam
    await Question.insertMany(questions);
    console.log('✅ Seeded Exam Questions');

    console.log('\n🌟 Data seeding completed successfully!');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    if (shouldExit) process.exit(1);
  }
};

if (process.argv[1] && (process.argv[1].endsWith('seed_data.js') || process.argv[1].includes('seed_data.js'))) {
  seedData(true);
}

