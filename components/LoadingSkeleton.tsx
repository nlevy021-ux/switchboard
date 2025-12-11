// components/LoadingSkeleton.tsx
"use client";

export function CardSkeleton() {
  return (
    <div className="mt-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4"></div>
    </div>
  );
}

export function InputSkeleton() {
  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-12 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

