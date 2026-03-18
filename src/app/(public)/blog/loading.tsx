export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-24 animate-pulse">
      <div className="text-center mb-16">
        <div className="h-12 bg-gray-200 rounded w-72 mx-auto mb-6" />
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto" />
      </div>
      
      {/* Featured post skeleton */}
      <div className="h-96 md:h-[500px] bg-gray-200 rounded-3xl mb-16 border border-[#E0F2F1] shadow-card" />
      
      {/* Grid of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-[#E0F2F1] overflow-hidden bg-white shadow-sm h-full flex flex-col">
            <div className="h-56 bg-gray-200" />
            <div className="p-8 space-y-4 flex-grow">
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-8 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="h-6 bg-gray-200 rounded-lg w-24 mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
