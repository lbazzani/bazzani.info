import { notFound } from 'next/navigation';
import SingleSketchViewer from '../../../components/SingleSketchViewer';

const sketches: Record<string, { title: string; note: string; sketchName: string }> = {
  powergame: {
    title: 'Power Game',
    note: '@bazzani - gen 2022',
    sketchName: 'powerGame',
  },
  simpleclock: {
    title: 'Simple Clock',
    note: '@bazzani - gen 2022',
    sketchName: 'simpleClock',
  },
  liketheworld: {
    title: 'Like The World',
    note: '@bazzani - gen 2022',
    sketchName: 'likeTheWorld',
  },
  tecnocity: {
    title: 'TecnoCity',
    note: '@bazzani',
    sketchName: 'tecnocity',
  },
  circleart: {
    title: 'Circle Art',
    note: '@bazzani',
    sketchName: 'circleart',
  },
};

export async function generateStaticParams() {
  return Object.keys(sketches).map((nome) => ({
    nome,
  }));
}

export default async function SketchPage({ params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  const sketch = sketches[nome];

  if (!sketch) {
    notFound();
  }

  return (
    <SingleSketchViewer
      title={sketch.title}
      note={sketch.note}
      sketchName={sketch.sketchName}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  const sketch = sketches[nome];

  if (!sketch) {
    return {
      title: 'Sketch Not Found',
    };
  }

  return {
    title: `${sketch.title} - Generative Art | Lorenzo Bazzani`,
    description: `${sketch.title} - ${sketch.note}. Interactive p5.js generative art sketch.`,
  };
}
