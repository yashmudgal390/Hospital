export default function ServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-24 animate-pulse">
      <div className="text-center mb-16">
        <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-[#E0F2F1] overflow-hidden bg-white shadow-sm">
            <div className="h-56 bg-gray-200" />
            <div className="p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="h-8 bg-gray-200 rounded-xl w-32 mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
