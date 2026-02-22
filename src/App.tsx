import Presentation from './components/Presentation';
import CoverSlide from './slides/CoverSlide';
import ProblemSlide from './slides/ProblemSlide';
import SolutionSlide from './slides/SolutionSlide';
import ArchitectureSlide from './slides/ArchitectureSlide';
import ALabSlide from './slides/ALabSlide';
import TractionSlide from './slides/TractionSlide';
import MarketSlide from './slides/MarketSlide';
import FinancialsSlide from './slides/FinancialsSlide';
import AskSlide from './slides/AskSlide';
import OutroSlide from './slides/OutroSlide';

export default function App() {
    return (
        <Presentation
            slides={[
                <CoverSlide key="cover" />,
                <ProblemSlide key="problem" />,
                <SolutionSlide key="solution" />,
                <ArchitectureSlide key="arch" />,
                <ALabSlide key="alab" />,
                <TractionSlide key="traction" />,
                <MarketSlide key="market" />,
                <FinancialsSlide key="financials" />,
                <AskSlide key="ask" />,
                <OutroSlide key="outro" />,
            ]}
        />
    );
}
