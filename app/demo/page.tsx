import SketchViewer from './SketchViewer';
import { powerGame } from '../sketches/powerGame';
import { simpleClock } from '../sketches/simpleClock';
import { topNews } from '../sketches/topNews';
import { tecnocity } from '../sketches/tecnocity';
import { circleart } from '../sketches/circleart';
import { rectart } from '../sketches/rectart';

const sketches = [
  {
    title: 'Power Game',
    note: '@bazzani - gen 2022',
    sketchFunction: powerGame,
  },
  {
    title: 'Simple Clock',
    note: '@bazzani - gen 2022',
    sketchFunction: simpleClock,
  },
  {
    title: 'Top News',
    note: '@bazzani',
    sketchFunction: topNews,
  },
  {
    title: 'TecnoCity',
    note: '@bazzani',
    sketchFunction: tecnocity,
  },
  {
    title: 'CircleArt',
    note: '@bazzani',
    sketchFunction: circleart,
  },
  {
    title: 'RectangleArt',
    note: '@bazzani',
    sketchFunction: rectart,
  },
];

export default function DemoPage() {
  return <SketchViewer sketches={sketches} />;
}
