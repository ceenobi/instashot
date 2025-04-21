type PageProps = {
  classname?: string;
  children: React.ReactNode;
};
export default function Container({ classname, children }: PageProps) {
  return <div className={`py-5 lg:px-8 mx-auto ${classname}`}>{children}</div>;
}
