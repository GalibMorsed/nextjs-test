import React from 'react'

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Sidebar</h2>
      <ul className="space-y-2">
        <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Home</a></li>
        <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">About</a></li>
        <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Contact</a></li>
      </ul>
    </div>
  )
}
