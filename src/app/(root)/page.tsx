import SearchForm from "../../components/SearchForm";
import StartupCard from "../../components/StartupCard";

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {

  const query = (await searchParams).query;

  const posts = [{
    _createdAt: new Date(),
    views: 55,
    author: { _id: 1, name: 'John Doe' },
    _id: 1,
    description: 'This is description',
    category: 'Tech',
    title: 'This is title',
    image: 'https://via.placeholder.com/150',
  }, {
    _createdAt: new Date(),
    views: 55,
    author: { _id: 1, name: 'Jane Smith' },
    _id: 2,
    description: 'This is description',
    image: 'https://via.placeholder.com/150',
    category: 'Tech',
    title: 'This is title',
  },{
    _createdAt: new Date(),
    views: 55,
    author: { _id: 1, name: 'Alice Johnson' },
    _id: 3,
    description: 'This is description',
    image: 'https://via.placeholder.com/150',
    category: 'Tech',
    title: 'This is title',
  },]


  return (
    <>
    </>
  );
}
