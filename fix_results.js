import { MongoClient, ObjectId } from 'mongodb';

async function fix() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to DB native');
    const db = client.db('cdac-examweb');
    
    const resultsCollection = db.collection('results');
    const examsCollection = db.collection('exams');
    const questionsCollection = db.collection('questions');

    const results = await resultsCollection.find({}).toArray();
    let updated = 0;

    for (const res of results) {
      if (!res.examId) continue;
      const examDetails = await examsCollection.findOne({ _id: new ObjectId(res.examId) });
      const questionsCount = await questionsCollection.countDocuments({ examId: new ObjectId(res.examId) });
      
      const maxPossibleScore = questionsCount;
      const percentage = maxPossibleScore > 0 ? (res.score / maxPossibleScore) * 100 : 0;
      const passingScore = examDetails?.passingScore ?? 40;
      const isPassed = percentage >= passingScore;
      
      if (res.passed !== isPassed) {
        await resultsCollection.updateOne(
          { _id: res._id },
          { $set: { passed: isPassed } }
        );
        updated++;
      }
    }
    console.log('Updated ' + updated + ' results natively.');
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

fix();
