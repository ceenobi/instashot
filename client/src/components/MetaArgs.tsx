import { Helmet } from "react-helmet-async";

interface MetaArgs {
  title: string;
  description: string;
}

export default function MetaArgs({ title, description }: MetaArgs) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
