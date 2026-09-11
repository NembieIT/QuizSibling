import 'dotenv/config';
import connectDB from './config/db.js';
import Set from './models/Set.js';

const sampleSets = [
  {
    title: 'Từ vựng tiếng Anh - Cấp độ cơ bản',
    description: 'Các từ vựng thông dụng cho người mới bắt đầu.',
    terms: [
      { term: 'apple', definition: 'quả táo' },
      { term: 'book', definition: 'quyển sách' },
      { term: 'dog', definition: 'con chó' },
      { term: 'cat', definition: 'con mèo' },
      { term: 'house', definition: 'ngôi nhà' },
      { term: 'water', definition: 'nước' },
      { term: 'friend', definition: 'bạn bè' },
      { term: 'school', definition: 'trường học' },
    ],
  },
  {
    title: 'Kiến thức lập trình - MERN',
    description: 'Các khái niệm cốt lõi trong MERN Stack.',
    terms: [
      { term: 'MongoDB', definition: 'Cơ sở dữ liệu NoSQL dạng document' },
      { term: 'Express', definition: 'Framework web tối giản cho Node.js' },
      { term: 'React', definition: 'Thư viện JavaScript để xây dựng giao diện' },
      { term: 'Node.js', definition: 'Runtime JavaScript trên server' },
      { term: 'REST API', definition: 'Kiến trúc API dùng HTTP methods' },
      { term: 'Component', definition: 'Khối xây dựng giao diện trong React' },
      { term: 'Hook', definition: 'Hàm giúp dùng state và lifecycle trong React' },
    ],
  },
  {
    title: 'Địa lý Việt Nam',
    description: 'Kiến thức địa lý cơ bản.',
    terms: [
      { term: 'Thủ đô Việt Nam', definition: 'Hà Nội' },
      { term: 'Sông dài nhất Việt Nam', definition: 'Sông Hồng' },
      { term: 'Dãy núi cao nhất Việt Nam', definition: 'Dãy Hoàng Liên Sơn (Fan Si Pan)' },
      { term: 'Biển Đông cực Nam', definition: 'Bạch Long Vĩ' },
      { term: 'Đồng bằng lớn nhất miền Tây', definition: 'Đồng bằng Sông Cửu Long' },
    ],
  },
];

const run = async () => {
  await connectDB();
  await Set.deleteMany({});
  const created = await Set.insertMany(sampleSets);
  console.log(`Seeded ${created.length} sets`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});