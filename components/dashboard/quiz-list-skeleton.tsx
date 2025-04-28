const QuizListSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#e6e6e6]">
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Data</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Visualizações</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Respostas</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#667085]">Conversão</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-[#667085]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <tr key={index} className="border-b border-[#e6e6e6] animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-12 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default QuizListSkeleton
