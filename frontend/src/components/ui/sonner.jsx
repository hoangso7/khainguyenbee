import { Toaster as Sonner } from "sonner"

function Toaster() {
  return (
    <Sonner
      theme="light"
      richColors
      expand
      duration={3000}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          // Force solid background and good contrast
          toast:
            "group toast bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-lg",
          description: "group-[.toast]:text-neutral-600 dark:group-[.toast]:text-neutral-300",
          actionButton:
            "group-[.toast]:bg-amber-500 group-[.toast]:text-white group-[.toast]:hover:bg-amber-600",
          cancelButton:
            "group-[.toast]:bg-neutral-200 group-[.toast]:text-neutral-800 group-[.toast]:hover:bg-neutral-300 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-100 dark:group-[.toast]:hover:bg-neutral-700",
        },
      }}
    />
  )
}

export { Toaster }
