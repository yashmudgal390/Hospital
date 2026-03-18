export default function GalleryLoading() {
  return (
    <div className="container mx-auto px-4 py-24 animate-pulse">
      <div className="text-center mb-16">
        <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded w-80 mx-auto" />
      </div>
      
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="bg-gray-200 rounded-3xl mb-4 border border-[#E0F2F1] shadow-sm"
            style={{ height: `${160 + (i % 4) * 80}px` }}
          />
        ))}
      </div>
    </div>
  )
}
