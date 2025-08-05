import React from "react";

function Loading() {
  return (
    <div class="flex  space-x-1 justify-center items-center">
      <div class="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div class="h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div class="h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
    </div>
  );
}

export default Loading;
