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
      <section className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-purple-100 px-6 py-12 rounded-lg shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-purple-700 mb-4 leading-tight">
          Pitch Your Startup,<br />
          <span className="text-blue-600">Connect with Entrepreneurs</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-700 text-center mb-8 max-w-xl">
          Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competitions.
        </p>
        <div className="w-full max-w-md">
          <SearchForm query={query} />
        </div>
      </section>
      <section className="section_container">
        <p className="text-30-semibold">
          {query ? `Search Results for: "${query}"` : "Explore startups by searching above."}
        </p>

        <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post : StartupCardType, index: number) => (
            <StartupCard key={post?._id} post={post}/>
          ))}
        </ul>
      </section>
    </>
  );
}
