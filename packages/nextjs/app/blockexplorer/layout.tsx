// Deprecated route; layout kept minimal for redirect-only page
export const metadata = {
  title: "Block Explorer",
  description: "Deprecated — redirecting to Debug",
};

const BlockExplorerLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default BlockExplorerLayout;
