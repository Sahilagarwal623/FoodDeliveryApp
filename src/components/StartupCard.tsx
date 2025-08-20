import React from 'react'
import { EyeIcon } from 'lucide-react'
import { formatDate } from '../lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StartupCard({ post }: { post: any }) {
  return (
    <li className="relative p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col">
      {/* Author section - top right */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 px-2 py-1 rounded-full shadow-sm">
        <img
          src={post.author.image}
          alt={post.author.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <div className="flex flex-col">
          <p className="text-xs font-medium text-gray-800">{post.author.name}</p>
          <p className="text-[10px] text-gray-400">ID: {post.author._id}</p>
        </div>
      </div>
      <span className="text-xs text-gray-400 mb-1">{formatDate(post._createdAt)}</span>
      <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
      <p className="text-gray-600 mt-2 flex-1">{post.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <EyeIcon className="w-4 h-4 text-gray-400" />
          {post.views}
        </span>
        <span className="text-sm text-gray-500">Category: {post.category}</span>
      </div>

      <Link href={`/startup/${post._id}`} className="mt-3 text-blue-600 hover:underline flex flex-col gap-2">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-32 object-cover rounded-md bg-gray-100"
        />
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/?query=${post.category.toLowerCase()}`}
          className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition"
        >
          <p className="m-0">{post.category}</p>
        </Link>
        <Button asChild className="ml-auto">
          <Link href={`/startup/${post._id}`}>
            Details
          </Link>
        </Button>
      </div>
    </li>
  )
}
