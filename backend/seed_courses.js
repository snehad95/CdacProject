import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';

dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cdac-examweb';

const pgcpACData = {
  category: "Software Development",
  categoryBgColor: "#f8a39a",
  title: "PGCP-AC",
  fullName: "Post Graduate Certificate Programme in Advanced Computing",
  abbr: "AC",
  iconColor: "#2a6ce4",
  focus: "PGCP-AC is the most popular PG Certificate Programme of C-DAC. The course is targeted towards Engineering Graduates and MCA/MSc who wish to venture into the domain of advanced computing. The course aims to groom the students to enable them to work on current technology scenarios as well as prepare them to keep pace with the changing face of technology and the requirements of the growing IT industry. The entire course syllabus, courseware, teaching methodology and the course delivery have been derived from the rich research and development background of C-DAC. Running successfully for 25 years, the PGCP-AC course has produced thousands of professionals, who are well positioned in the industry today.",
  eligibility: "The education eligibility criteria for the PGCP-AC course is:\n\nGraduate in Engineering or Technology (10+2+4 or 10+3+3 years) in IT / Computer Science / Electronics / Telecommunications / Electrical / Instrumentation, OR MSc/MS (10+2+3+2 years) in Computer Science, IT, Electronics OR\nGraduate in any discipline of Engineering,OR\nMCA, MCM, OR\nPost Graduate Degree in Physics/ Mathematics / Statistics, OR\nPost Graduate Degree in Management with graduation in IT / Computer Science / Computer Applications.\nThe candidates must have secured a minimum of 55% marks in their qualifying examination.",
  fees: "The Post Graduate Certificate Programme in Advanced Computing (PGCP-AC) course will be delivered in fully ONLINE or fully PHYSICAL mode. The total course fee and payment details for the fully PHYSICAL or fully ONLINE mode of delivery is as detailed herein below:\n\nPHYSICAL Mode of Delivery:\nThe course fee for the fully PHYSICAL mode of delivery is INR. 90,000/- plus Goods and Service Tax (GST) as applicable by Government of India (GOI).The course fees for PGCP-AC course has to be paid in two installments as per the schedule.\n\nFirst installment is INR. 10,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nSecond installment is INR. 80,000/- plus Goods and Service Tax (GST) as applicable by GOI.\n\nONLINE Mode of Delivery:\nThe course fee of the fully ONLINE mode of delivery is INR. 76,500/- plus Goods and Service Tax (GST) as applicable by GOI.\nThe course fees for PGCP-AC course has to be paid in two installments as per the schedule.\n\nFirst installment is INR. 10,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nSecond installment is INR. 66,500/- plus Goods and Service Tax (GST) as applicable by GOI.\n\nThe course fee includes expenses towards delivering classes, conducting examinations, final mark-list and certificate, and placement assistance provided.\n\nThe first installment course fee of Rs 10,000/- + GST on it as applicable at the time of payment is to be paid online as per the schedule. It can be paid using credit/debit cards through the payment gateway. The first installment of the course fees is to be paid after seat is allocated during counseling rounds.\n\nThe second installment of the course fees is to be paid before the course commencement & using netbanking, UPI, and credit/debit cards through the payment gateway.\n\nNOTE: Candidates may take note that no Demand Draft (DD) or cheque or cash will be accepted at any C-DAC training centre towards payment of any installment of course fees.",
  outcome: "After completion of course students will be able to acquire the following skills:\n\nUse technologies to access and interpret information effectively\nApply their analytical skills to investigate unfamiliar problems using web technologies like HTML 5.0, CSS, Java Script, Jquery, React JS\nUse quantitative data confidently and competently\nUse communication technologies competently\nUnderstand the multi-tier architecture of web-based enterprise applications using. Enterprise JavaBeans. Integrate Servlets, JSPs with EJB and Databases in J2EE application\nUnderstand .net architecture, develop and maintain the application",
  training: [
    {
      name: "C-DAC ACTS - Bengaluru",
      address: "No 87-A, 6th Cross, Opp. KFC, Wipro Gate, Electronic City, 1st Phase, Bengaluru, Karnataka 560100",
      phone: "080-28523300",
      contact: "Course Enquiries - Mr. R. Guru Prasad, Hostel Enquiries - Arun Shankar",
      email: "Course Enquiries - actsb[at]cdac[dot]in, Hostel Enquiries - arun[at]cdac[dot]in",
      otherCourses: "PGCP-AC, PGCP-ESD, PGCP-ITISS, PGCP-BDA"
    },
    {
      name: "Lakshya",
      address: "Plot No.-3, Adarsh Vihar, KIIT Square Behind Big Bazar, Patia Bhubaneswar Odisha 751024",
      phone: "9040022750",
      contact: "Mr Priyabratakar",
      email: "priyabrata[dot]kar[at]lakshyatraining[dot]org",
      otherCourses: "PGCP-AC"
    }
  ],
  contents: [
    { title: "Concepts of Operating System & Software Development Methodologies", duration: "60 Hours", modules: ["Fundamentals of Operating Systems", "Process & Thread Management", "Scheduling", "Deadlocks", "Memory Management", "File Systems", "Linux Commands", "Shell Scripting", "SDLC Models", "Agile & Scrum", "Software Testing Basics", "Requirements Engineering", "UML Diagrams", "Design Principles"] },
    { title: "C++ Programming", duration: "90 Hours", modules: ["Introduction to C++", "Data Types & Operators", "Control Structures", "Functions", "Arrays & Pointers", "Classes & Objects", "Inheritance", "Polymorphism", "Templates", "Exception Handling", "STL"] },
    { title: "Database Technologies", duration: "90 Hours", modules: ["RDBMS Concepts", "SQL Queries", "PL/SQL", "Normalization", "Database Design", "Indexes", "Transactions", "NoSQL Basics"] },
    { title: "Object Oriented Programming with Java", duration: "150 Hours", modules: ["Java Fundamentals", "OOPS in Java", "Exception Handling", "Multithreading", "Collections Framework", "IO Streams", "JDBC"] },
    { title: "Algorithms and Data Structures (Using Java)", duration: "90 Hours", modules: ["Complexity Analysis", "Searching & Sorting", "Linked Lists", "Stacks & Queues", "Trees & Graphs", "Hashing", "Dynamic Programming"] },
    { title: "Web Programming Technologies", duration: "150 Hours", modules: ["HTML5", "CSS3", "JavaScript", "jQuery", "React JS", "Responsive Design"] },
    { title: "Web-based Java Programming", duration: "150 Hours", modules: ["Servlets", "JSP", "EJB", "Spring Boot", "RESTful Web Services", "Hibernate"] },
    { title: "Microsoft .Net Technologies", duration: "120 Hours", modules: ["C# Language", "ASP.NET Core", "Entity Framework", "Web API"] },
    { title: "Aptitude", duration: "60 Hours", modules: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"] },
    { title: "Effective Communication", duration: "60 Hours", modules: ["Soft Skills", "Presentation Skills", "Interview Preparation", "Group Discussions"] }
  ],
  faqs: [
    { q: "Why is the nomenclature of Post Graduate Diploma in Advanced Computing changed to Post Graduate Certificate Programme in Advanced Computing?", a: "C-DAC’s Post Graduate Diploma in Advanced Computing (PG-DAC) Course nomenclature is enhanced as Post Graduate Certificate Programme in Advanced Computing (PGCP-AC) to bring PG-DAC course in line with NCVET standards and guidelines." },
    { q: "What is the educational eligibility criteria for applying to PG Certificate Programme in Advanced Computing?", a: "A candidate with Graduate in Engineering or Technology (10+2+4 or 10+3+3 years) in IT / Computer Science / Electronics / Telecommunications / Electrical / Instrumentation. OR MSc/ MS (10+2+3+2 years) in Computer Science, IT, Electronics." },
    { q: "What is the process of selection to join PG Certificate Programmes?", a: "The selection process to join C-DAC's PG Certificate prorgammes is by qualifying in C-DAC Common Admission Test (C-CAT)." },
    { q: "What is Course Fees of PGCP-AC?", a: "The fee for the PGCP-AC course conducted in fully physical mode is INR. 90,000/- + GST. Online mode is INR. 76,500/- + GST." }
  ],
  flyerUrl: "/PDF_PGCP_AC.pdf"
};

const pgcpASSDData = {
  category: "Software Development",
  categoryBgColor: "#f8a39a",
  title: "PGCP-ASSD",
  fullName: "Post Graduate Certificate Programme in Advanced Secure Software Development",
  abbr: "ASSD",
  iconColor: "#2ba4bc",
  focus: "PG Certificate Programme in Advanced Secure Software Development (PGCP-ASSD) course emerges from the growing demand for skilled Cyber Security professionals. With the increasing complexity of cyber threats and the rise in digital footprints, there is a need for experts who can safeguard, develop & deploy secure systems and networks. This course covers a wide array of topics, from foundational programming in C/C++ and data structures to advanced areas like secure web development, cryptography, system programming, and AI-driven security techniques. By equipping learners with hands-on skills in secure coding, cryptographic techniques, and penetration testing, the program aims to develop professionals ready to tackle real-world cybersecurity challenges.\n\nThe main objectives of the PGCP-ASSD course is :\n• To equip learners with a strong foundation in programming languages, system programming, cryptography, network security, and software engineering principles.\n• To provide in-depth knowledge of secure application development methodologies and techniques.\n• To introduce learners to the application of artificial intelligence in cyber security.\n• To prepare learners for careers in cyber security, Vulnerability Assessment, penetration testing, and secure software development including DevSecOps.",
  eligibility: "The educational eligibility criteria for PGCP-ASSD course is:\n\nGraduate in Engineering or Technology (10+2+4 or 10+3+3 years) in IT / Computer Science / Electronics / Telecommunications / Electrical / Instrumentation, OR\nMSc/MS (10+2+3+2 years) in Computer Science, IT, Electronics, OR\nMCA\n\nThe candidate must have minimum 55% marks in the qualifying degree.",
  fees: "PGCP-ASSD course will be delivered in fully PHYSICAL mode. The total course fee and payment details are as detailed herein below:\n\nThe total course fee is INR. 90,000/- plus Goods and Service Tax (GST) as applicable by Government of India (GOI).\n\nThe course fee for PGCP-ASSD has to be paid in two installments as per the schedule.\n\nFirst installment is INR. 10,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nSecond installment is INR. 80,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nThe course fee includes expenses towards delivering classes, conducting examinations, final mark-list and certificate, and placement assistance provided.\n\nThe first installment course fee of Rs 10,000/- + GST on it as applicable at the time of payment is to be paid online as per the schedule. It can be paid using credit/debit cards through the payment gateway. The first installment of the course fees is to be paid after seat is allocated during counseling rounds.\n\nThe second installment of the course fees is to be paid before the course commencement using netbanking, UPI, and credit/debit cards through the payment gateway.\n\nNOTE: Candidates may take note that no Demand Draft (DD) or cheque or cash will be accepted at any C-DAC training centre towards payment of any installment of course fees.",
  outcome: "After completing this course, students will be well-prepared to meet the industry requirements in the area of Cyber Security. They will be able to tackle complex cybersecurity challenges and contribute to the development of secure and resilient systems.\n\n• Proficiency in C and C++ programming, including object-oriented programming concepts and data structures.\n• Mastery of Linux system programming, including file systems, processes, threads, and network programming.\n• Ability to develop secure web applications, including input validation, output encoding, and protection against common vulnerabilities.\n• Knowledge of secure software engineering principles, such as threat modelling, code review, testing, vulnerability assessment and DevSecOps\n• Understanding of cryptographic algorithms, key management, and secure communication protocols.\n• Familiarity with AI techniques for cyber security, including anomaly detection and intrusion detection.",
  training: [
    {
      name: "C-DACs - Advanced Computing Training School (Hyderabad)",
      address: "Maithrivihar Building, Satyam Theatre Road, Opposite Bank of India, Near Ameerpet Metro Station, Ameerpet, Hyderabad Telangana 500016",
      phone: "7382053731 / 32",
      contact: "Mr. BSRK Varaprasad",
      email: "bsrkvprasad[at]cdac[dot]in / training-hyd[at]cdac[dot]in",
      otherCourses: "PGCP-AC, PGCP-VLSI, PGCP-ESD, PGCP-ITISS, PGCP-ASSD, PGCP-BDA"
    }
  ],
  contents: [
    { title: "C and Data Structures", duration: "150 Hours", modules: ["Introduction to GNU Toolchain", "Tokens of C", "Storage Class Specifiers", "Arrays, Strings, Loops", "Pointers", "Structures, Unions, Enum", "Preprocessors", "Importance and Types of Data Structures", "Searching & Sorting algorithms", "Trees & Graphs"] },
    { title: "Object Oriented Programming using C++", duration: "90 Hours", modules: ["Classes & Objects", "Inheritance", "Polymorphism", "Templates", "Exception Handling", "STL"] },
    { title: "Linux System Programming", duration: "120 Hours", modules: ["File Systems", "Processes & Threads", "Network Programming", "System Calls"] },
    { title: "Cryptography & Network Security", duration: "90 Hours", modules: ["Symmetric/Asymmetric Encryption", "Key Management", "Digital Signatures", "Network Protocols Security"] },
    { title: "Secure Web Application Development", duration: "150 Hours", modules: ["Web Vulnerabilities", "Input Validation", "Output Encoding", "Secure Session Management"] },
    { title: "Secure Software Engineering", duration: "150 Hours", modules: ["Threat Modelling", "Code Review", "Secure Testing", "DevSecOps"] },
    { title: "AI for Cyber Security", duration: "150 Hours", modules: ["Anomaly Detection", "Intrusion Detection", "Machine Learning for Security"] },
    { title: "Aptitude", duration: "60 Hours", modules: ["Quantitative Aptitude", "Logical Reasoning"] },
    { title: "Effective Communication", duration: "60 Hours", modules: ["Soft Skills", "Professional Communication"] },
    { title: "Project", duration: "180 Hours", modules: ["Cyber Security Implementation Project"] }
  ],
  faqs: [
    { q: "What is the focus of PGCP-ASSD?", a: "The course focuses on Advanced Secure Software Development and Cyber Security." },
    { q: "Is PGCP-ASSD available online?", a: "Currently, this course is delivered in fully PHYSICAL mode." }
  ],
  flyerUrl: "/PDF_PGCP_ASSD.pdf",
  fileType: "PDF",
  fileSize: "969 KB",
  uploadDate: "27/11/2025"
};

const pgcpMCData = {
  category: "Software Development",
  categoryBgColor: "#f8a39a",
  title: "PGCP-MC",
  fullName: "Post Graduate Certificate Programme in Mobile Computing",
  abbr: "MC",
  iconColor: "#e5673a",
  focus: "The Post-Graduate Certificate Programme in Mobile Computing (PGCP-MC) is targeted towards electronics/computer sciences/IT engineers who wish to venture into the domain of mobile computing. The course aims to groom the students to enable them to work on current technology scenarios as well as prepare them to keep pace with the changing face of technology and requirements of an exponentially growing mobile industry. The entire course syllabus, courseware, teaching methodology and the course delivery have been derived from the rich research and development background of C-DAC.",
  eligibility: "The educational eligibility criteria for PGCP-MC course is:\n\nGraduate in Engineering or Technology (10+2+4 or 10+3+3 years) in IT / Computer Science / Electronics / Telecommunications / Electrical / Instrumentation, OR\nMSc/MS (10+2+3+2 years) in Computer Science, IT, Electronics. OR\nGraduate in any discipline of Engineering, OR\nMCA, MCM, OR\nPost Graduate Degree in Physics / Mathematics / Statistics, OR\nPost Graduate Degree in Management with graduation in IT / Computer Science / Computer Applications\n\nThe candidates must have secured a minimum of 55% marks in their qualifying examination.",
  fees: "PGPC-MC course will be delivered in fully PHYSICAL mode. The total course fee and payment details are as detailed herein below:\n\nThe total course fee is INR. 90,000/- plus Goods and Service Tax (GST) as applicable by Government of India (GOI).\n\nThe course fee for PGCP-MC has to be paid in two installments as per the schedule.\n\nFirst installment is INR. 10,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nSecond installment is INR. 80,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nThe course fee includes expenses towards delivering classes, conducting examinations, final mark-list and certificate, and placement assistance provided.\n\nThe first installment course fee of Rs 10,000/- + GST on it as applicable at the time of payment is to be paid online as per the schedule. It can be paid using credit/debit cards through the payment gateway. The first installment of the course fees is to be paid after seat is allocated during counseling rounds.\n\nThe second installment of the course fees is to be paid before the course commencement using netbanking, UPI, and credit/debit cards through the payment gateway.\n\nNOTE: Candidates may take note that no Demand Draft (DD) or cheque or cash will be accepted at any C-DAC training centre towards payment of any installment of course fees.",
  outcome: "After completion of course students will be able to acquire the following skills:\n• Design and build advanced native apps on Android and iOS platform.\n• Work with cross-functional teams to define, design, and ship new features.\n• Unit-test code for sturdiness, including edge cases, usability, and general reliability.\n• Design and build Hybrid mobile apps through React Native, HTML5, CSS, and JavaScript web standards.\n• Understand the multi-tier architecture of web-based enterprise applications using Enterprise JavaBeans.\n• How to think creatively, analytically and abstractly about computational problems.",
  training: [
    {
      name: "Sunbeam Institute of Information Technology (Pune)",
      address: "Sunbeam IT Park, Phase-II (Rajiv Gandhi Infotech Park) Hinjewadi, Pune Maharashtra 411057",
      phone: "8282829805",
      contact: "Mr. Nitin Kudale, C.E.O.",
      email: "siit[at]sunbeaminfo[dot]com",
      otherCourses: "PGCP-AC, PreDAC, PGCP-ESD, PGCP-MC, PGCP-ITISS, PGCP-BDA"
    }
  ],
  contents: [
    { title: "OS Concepts & Linux Programming", duration: "60 Hours", modules: ["Introduction to Operating System", "Processes Architecture", "Multithreading", "CPU Scheduling", "Linux Architecture", "Basic Commands", "Shell Programming"] },
    { title: "Introduction to DBMS", duration: "60 Hours", modules: ["RDBMS Concepts", "SQL Queries", "Database Design"] },
    { title: "Object Oriented Programming with Java", duration: "150 Hours", modules: ["Java Core", "OOPS Concepts", "Collections", "Exception Handling"] },
    { title: "Algorithms and Data Structures", duration: "90 Hours", modules: ["Data Structures", "Sorting & Searching", "Complexity Analysis"] },
    { title: "Web-Based Java Programming", duration: "60 Hours", modules: ["Servlets", "JSP", "JDBC", "EJB Integration"] },
    { title: "Mobile Programming (Android & iOS)", duration: "210 Hours", modules: ["Native Android Dev", "iOS Swift Programming", "Mobile UI/UX"] },
    { title: "Hybrid Mobile Apps Programming", duration: "210 Hours", modules: ["React Native", "Hybrid App Architecture", "Cross-platform components"] },
    { title: "AI on Mobile Platforms", duration: "90 Hours", modules: ["ML Models for Mobile", "On-device Intelligence", "TensorFlow Lite"] },
    { title: "Aptitude", duration: "60 Hours", modules: ["Quantitative", "Logical Reasoning"] },
    { title: "Effective Communication", duration: "60 Hours", modules: ["Professional Skills", "Interview Prep"] },
    { title: "Project", duration: "180 Hours", modules: ["End-to-end Mobile App Project"] }
  ],
  faqs: [
    { q: "Why is nomenclature of PG-DMC changed to PGCP-MC?", a: "C-DAC’s Post Graduate Diploma in Mobile Computing (PG-DMC) nomenclature is enhanced to PGCP-MC to bring it in line with NCVET standards, upgrading from 900 to 1200 hours." },
    { q: "What is the medium of instruction?", a: "The medium of instruction for the PG Certificate Programme is English." }
  ],
  flyerUrl: "/PDF_PGCP_MC.pdf",
  fileType: "PDF",
  fileSize: "952 KB",
  uploadDate: "27/11/2025"
};

const pgcpVLSIData = {
  category: "Electronics & Software",
  categoryBgColor: "#b2dcb3",
  title: "PGCP-VLSI",
  fullName: "Post Graduate Certificate Programme in VLSI Design",
  abbr: "VLSI",
  iconColor: "#6abf3e",
  focus: "PGCP-VLSI is a pioneering course offered by C-DAC to assist engineers who wish to gain theoretical as well as practical knowledge in the field of Very Large Scale Integration (VLSI) design. It will also prepare them to keep pace with the changing trends of VLSI technology and the requirements of an ever-growing VLSI design industry. The entire course syllabus, courseware, teaching methodology and the course delivery have been derived from the rich research and development background of C-DAC, which has a legacy of designing the PARAM range of supercomputers.",
  eligibility: "The educational eligibility criteria for PGCP-VLSI course is:\n\nGraduate in Engineering or Technology (10+2+4 or 10+3+3 years) in IT / Computer Science / Electronics / Telecommunications / Electrical / Instrumentation, OR \nM.Sc. /M.S. (10+2+3+2 years) in Computer Science, IT, Electronics.\n\nThe candidates must have secured a minimum of 55% marks in their qualifying examination.",
  fees: "PGCP-VLSI course will be delivered in fully PHYSICAL mode. The total course fee and payment details is as detailed herein below:\n\nThe total course fee is INR. 90,000/- plus Goods and Service Tax (GST) as applicable by Government of India (GOI).\n\nThe course fees for PGCP-VLSI has to be paid in two installments as per the schedule.\n\nFirst installment is INR. 10,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nSecond installment is INR. 80,000/- plus Goods and Service Tax (GST) as applicable by GOI.\nThe course fee includes expenses towards delivering classes, conducting examinations, final mark-list and certificate, and placement assistance provided.\n\nThe first installment course fee of Rs 10,000/- + GST on it as applicable at the time of payment is to be paid online as per the schedule. It can be paid using credit/debit cards through the payment gateway. The first installment of the course fees is to be paid after seat is allocated during counseling rounds.\n\nThe second installment of the course fees is to be paid before the course commencement using netbanking, UPI, and credit/debit cards through the payment gateway.\n\nNOTE: Candidates may take note that no Demand Draft (DD) or cheque or cash will be accepted at any C-DAC training centre towards payment of any installment of course fees.",
  outcome: "After completion of course students will be able to develop Field-Programmable Gate Array (FPGA) implementations, Application-Specific Integrated Circuit (ASIC) designs, CMOS design and SoCs in VLSI industry as VLSI designer/ chip designer. Students will also be able to develop a programmable chip using verilog and system verilog languages.",
  training: [
    {
      name: "C-DAC ACTS - Pune (Innovation Park)",
      address: "C-DAC Innovation Park Sr. No. 34/B/1 Panchvati, Pashan Pune Maharashtra 411008",
      phone: "020-25503134/136/107, 9373731598",
      contact: "Ms. Heera Mohanan",
      email: "acts[at]cdac[dot]in",
      otherCourses: "PGCP-AC, PGCP-VLSI, PGCP-ESD, PGCP-ITISS, PGCP-AI, PGCP-BDA, PGCP-HPCSA, CCST"
    }
  ],
  contents: [
    { title: "System Architecture", duration: "60 Hours", modules: ["Combinatorial Logic Design", "Sequential Logic Design", "State Machines", "Advanced Design Issues", "Metastability", "Noise Margins", "Power", "Fan-out", "Design Rules", "Skew", "Timing Considerations"] },
    { title: "Verilog HDL", duration: "150 Hours", modules: ["Introduction to Verilog", "Data Types", "Operators", "Behavioral Modeling", "Structural Modeling", "Test Benches"] },
    { title: "HDL Simulation and Synthesis", duration: "120 Hours", modules: ["Simulation Cycle", "Synthesis Rules", "Optimization", "Constraints"] },
    { title: "System Verilog", duration: "120 Hours", modules: ["Data Types", "Object Oriented Programming", "Randomization", "Inter-process Communication"] },
    { title: "Verification using UVM", duration: "120 Hours", modules: ["UVM Base Classes", "UVM Factory", "UVM Phases", "UVM Sequences"] },
    { title: "Programming Fundamentals & Scripting", duration: "150 Hours", modules: ["Linux Shell Scripting", "Python for VLSI", "Tcl Scripting"] },
    { title: "CMOS VLSI and Aspects of ASIC Design", duration: "120 Hours", modules: ["CMOS Inverters", "Layout Design", "ASIC Flow", "Physical Design"] },
    { title: "Aptitude", duration: "60 Hours", modules: ["Quantitative", "Logical Reasoning"] },
    { title: "Effective Communication", duration: "60 Hours", modules: ["Soft Skills", "Professional Ethics"] },
    { title: "Project", duration: "180 Hours", modules: ["RTL Design and Verification Project"] }
  ],
  faqs: [
    { q: "Why is nomenclature changed to PGCP-VLSI?", a: "To align with NCVET standards, upgrading from 900 to 1200 hours and 40 credits." },
    { q: "Is there a centralized placement cell?", a: "Yes, C-DAC has a Common Campus Placement Programme (CCPP) spread across five regions." }
  ],
  flyerUrl: "/PDF_PGCP_VLSI.pdf",
  fileType: "PDF",
  fileSize: "932 KB",
  uploadDate: "27/11/2025"
};

const seedCourses = async () => {
  try {
    await mongoose.connect(CONNECTION_URL);
    console.log("Connected to MongoDB for seeding...");
    
    // Clear existing to avoid duplicates
    await Course.deleteMany({ title: { $in: ["PGCP-AC", "PGCP-ASSD", "PGCP-MC", "PGCP-VLSI"] } });
    
    await Course.insertMany([pgcpACData, pgcpASSDData, pgcpMCData, pgcpVLSIData]);
    
    console.log("Courses PGCP-AC, PGCP-ASSD, PGCP-MC, and PGCP-VLSI seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedCourses();
