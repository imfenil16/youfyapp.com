import fs from 'fs';
import matter from 'gray-matter';
import hydrate from 'next-mdx-remote/hydrate';
import renderToString from 'next-mdx-remote/render-to-string';
import Head from 'next/head';
import Link from 'next/link';
import path from 'path';
import Layout from '../components/layout';
import { postFilePaths, POSTS_PATH } from '../utils/mdxUtils';

const components = {
  Head,
};

export default function PostPage({ source, frontMatter }) {
  const content = hydrate(source, { components });
  return (
    <Layout>
      <header>
        <nav>
          <Link href='/'>
            <a>👈 Go back home</a>
          </Link>
        </nav>
      </header>
      <div className='post-header'>
        <h1>{frontMatter.title}</h1>
        {frontMatter.description && (
          <p className='description'>{frontMatter.description}</p>
        )}
      </div>
      <main>{content}</main>

      <style jsx>{`
        .post-header h1 {
          margin-bottom: 0;
        }

        .post-header {
          margin-bottom: 2rem;
        }
        .description {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(POSTS_PATH, `${params.slug}.mdx`);
  const source = fs.readFileSync(postFilePath);

  const { content, data } = matter(source);

  const mdxSource = await renderToString(content, {
    components,
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};