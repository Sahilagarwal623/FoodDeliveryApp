import Form from 'next/form';
import SearchFormReset from './SearchFormReset';
import {Search} from 'lucide-react';
import { Button } from '@/components/ui/button';

function SearchForm({query}: {query?: string}) {

    return (
        <Form action='/' scroll={false} className="flex items-center gap-2 w-full search-form">
            <input
                name='query'
                defaultValue={query}
                className='search-input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
                placeholder='Seach for startups'
            />

            <div className='flex gap-2'>
                {query && <SearchFormReset />}
                <Button type='submit' className='search-btn bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition'>
                    <Search className="w-6 h-6" />
                </Button>
            </div>
        </Form>
    )
}

export default SearchForm