export default function ContactLoading() {
  return (
    <div className="container mx-auto px-4 py-24 animate-pulse">
      <div className="text-center mb-16 px-4">
        <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-6 shadow-sm" />
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto opacity-70" />
      </div>
      
      <div className="max-w-6xl mx-auto rounded-[2.5rem] border border-[#E0F2F1] shadow-card overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 min-h-[600px]">
          {/* Info Side Skeleton */}
          <div className="lg:col-span-2 bg-gray-200 p-12 space-y-12">
            <div className="h-10 bg-white/30 rounded w-48" />
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/20 rounded w-20" />
                    <div className="h-6 bg-white/20 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-12 border-t border-white/20 space-y-6">
              <div className="h-8 bg-white/20 rounded w-40" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-white/20 rounded w-full" />
              ))}
            </div>
          </div>
          
          {/* Form Side Skeleton */}
          <div className="lg:col-span-3 p-12 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-14 bg-gray-100 rounded-xl shadow-sm" />
              <div className="h-14 bg-gray-100 rounded-xl shadow-sm" />
              <div className="h-14 bg-gray-100 rounded-xl shadow-sm" />
              <div className="h-14 bg-gray-100 rounded-xl shadow-sm" />
            </div>
            <div className="h-40 bg-gray-100 rounded-xl shadow-sm" />
            <div className="h-14 bg-gray-100 rounded-2xl w-full shadow-sm" />
          </div>
        </div>
      </div>
      
      {/* Map Skeleton */}
      <div className="h-96 w-full bg-gray-200 rounded-3xl mt-12 shadow-sm border border-[#E0F2F1]" />
    </div>
  )
}
