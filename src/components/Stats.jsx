import React from 'react'

export default function Stats  () {
  return (
       
       <section className="p-6 bg-white">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
         {[
           { value: "$110B+", label: "Payments" },
           { value: "15M+", label: "Events" },
           { value: "100%", label: "Secure" },
           { value: "1 Min", label: "Registration Time" },
         ].map((item, index) => (
           <div key={index}>
             <div className="text-blue-500 text-2xl font-bold">
               {item.value}
             </div>
             <div className="text-gray-600 text-sm">{item.label}</div>
           </div>
         ))}
       </div>
     </section>
  )
}
