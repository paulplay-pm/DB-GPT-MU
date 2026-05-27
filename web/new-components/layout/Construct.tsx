function ConstructLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col h-full w-full dark:bg-gradient-dark bg-gradient-light bg-cover bg-center'>
      {children}
    </div>
  );
}

export default ConstructLayout;