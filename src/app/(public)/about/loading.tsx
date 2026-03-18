export default function AboutLoading() {
  return (
    <div className="container mx-auto px-4 py-24 animate-pulse">
      <div className="flex flex-col md:flex-row gap-12 mb-16 items-center">
        <div className="w-64 h-64 bg-gray-200 rounded-full shrink-0 shadow-sm" />
        <div className="space-y-6 flex-1 w-full">
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  )
}
