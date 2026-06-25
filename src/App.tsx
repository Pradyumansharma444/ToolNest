import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { TransitionProvider } from './components/navigation/TransitionContext';
import { PageTransition } from './components/navigation/PageTransition';
import { setupGlobalPreloader } from './components/navigation/PreloadRegistry';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import AllToolsPage from './pages/AllToolsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// PDF Tools
import MergePdf from './pages/tools/MergePdf';
import SplitPdf from './pages/tools/SplitPdf';
import CompressPdf from './pages/tools/CompressPdf';
import PdfToWord from './pages/tools/PdfToWord';
import OcrPdf from './pages/tools/OcrPdf';
import EsignPdf from './pages/tools/EsignPdf';
import UnlockPdf from './pages/tools/UnlockPdf';
import RotatePdf from './pages/tools/RotatePdf';
import WatermarkPdf from './pages/tools/WatermarkPdf';

// Image Tools
import CompressImage from './pages/tools/CompressImage';
import ResizeImage from './pages/tools/ResizeImage';
import CropImage from './pages/tools/CropImage';
import RemoveBg from './pages/tools/RemoveBg';
import UpscaleImage from './pages/tools/UpscaleImage';
import ConvertImage from './pages/tools/ConvertImage';
import ColorCorrect from './pages/tools/ColorCorrect';
import WatermarkImage from './pages/tools/WatermarkImage';

// Text Tools
import SpellCheck from './pages/tools/SpellCheck';
import Paraphrase from './pages/tools/Paraphrase';
import WordCounter from './pages/tools/WordCounter';
import DiffChecker from './pages/tools/DiffChecker';
import CaseConverter from './pages/tools/CaseConverter';
import TextToSpeech from './pages/tools/TextToSpeech';

// Spreadsheet Tools
import CsvToJson from './pages/tools/CsvToJson';
import JsonToCsv from './pages/tools/JsonToCsv';
import CsvToXml from './pages/tools/CsvToXml';
import CsvToSql from './pages/tools/CsvToSql';
import MergeCsv from './pages/tools/MergeCsv';
import SplitCsv from './pages/tools/SplitCsv';
import FakeData from './pages/tools/FakeData';

// Calculator Tools
import CurrencyConverter from './pages/tools/CurrencyConverter';
import TimezoneConverter from './pages/tools/TimezoneConverter';
import UnitConverter from './pages/tools/UnitConverter';
import PercentageCalculator from './pages/tools/PercentageCalculator';
import TipCalculator from './pages/tools/TipCalculator';
import BmiCalculator from './pages/tools/BmiCalculator';
import LoanCalculator from './pages/tools/LoanCalculator';

// Resize Tools
import ResizeByDimensions from './pages/tools/ResizeByDimensions';
import SocialMediaResize from './pages/tools/SocialMediaResize';

// Enhancer Tools
import AiUpscale from './pages/tools/AiUpscale';
import RemoveBgPro from './pages/tools/RemoveBgPro';
import Sharpen from './pages/tools/Sharpen';
import ArtFilters from './pages/tools/ArtFilters';

// New Tool Lazy Imports
const JsonFormatter = lazy(() => import('./pages/tools/JsonFormatter'));
const XmlFormatter = lazy(() => import('./pages/tools/XmlFormatter'));
const Base64Encoder = lazy(() => import('./pages/tools/Base64Encoder'));
const UrlEncoder = lazy(() => import('./pages/tools/UrlEncoder'));
const HtmlEncoder = lazy(() => import('./pages/tools/HtmlEncoder'));
const QrCodeGenerator = lazy(() => import('./pages/tools/QrCodeGenerator'));
const UuidGenerator = lazy(() => import('./pages/tools/UuidGenerator'));
const JwtDecoder = lazy(() => import('./pages/tools/JwtDecoder'));
const HashGenerator = lazy(() => import('./pages/tools/HashGenerator'));
const RegexTester = lazy(() => import('./pages/tools/RegexTester'));
const CodeMinifier = lazy(() => import('./pages/tools/CodeMinifier'));
const MarkdownConverter = lazy(() => import('./pages/tools/MarkdownConverter'));
const UnixTimestamp = lazy(() => import('./pages/tools/UnixTimestamp'));
const JsonToYaml = lazy(() => import('./pages/tools/JsonToYaml'));
const CssBeautifier = lazy(() => import('./pages/tools/CssBeautifier'));
const PdfToJpg = lazy(() => import('./pages/tools/PdfToJpg'));
const WordToPdf = lazy(() => import('./pages/tools/WordToPdf'));
const PowerpointToPdf = lazy(() => import('./pages/tools/PowerpointToPdf'));
const PdfToPowerpoint = lazy(() => import('./pages/tools/PdfToPowerpoint'));
const JpgToPdf = lazy(() => import('./pages/tools/JpgToPdf'));
const HtmlToPdf = lazy(() => import('./pages/tools/HtmlToPdf'));
const EditPdf = lazy(() => import('./pages/tools/EditPdf'));
const ProtectPdf = lazy(() => import('./pages/tools/ProtectPdf'));
const OrganizePdf = lazy(() => import('./pages/tools/OrganizePdf'));
const PageNumbers = lazy(() => import('./pages/tools/PageNumbers'));
const CropPdf = lazy(() => import('./pages/tools/CropPdf'));
const ComparePdf = lazy(() => import('./pages/tools/ComparePdf'));
const RedactPdf = lazy(() => import('./pages/tools/RedactPdf'));
const RepairPdf = lazy(() => import('./pages/tools/RepairPdf'));
const PdfToPdfA = lazy(() => import('./pages/tools/PdfToPdfA'));
const PdfForms = lazy(() => import('./pages/tools/PdfForms'));
const AiSummarizer = lazy(() => import('./pages/tools/AiSummarizer'));
const TranslatePdf = lazy(() => import('./pages/tools/TranslatePdf'));
const ScanToPdf = lazy(() => import('./pages/tools/ScanToPdf'));

const VideoCompressor = lazy(() => import('./pages/tools/VideoCompressor'));
const VideoTrimmer = lazy(() => import('./pages/tools/VideoTrimmer'));
const VideoToGif = lazy(() => import('./pages/tools/VideoToGif'));
const VideoToAudio = lazy(() => import('./pages/tools/VideoToAudio'));
const VideoConverter = lazy(() => import('./pages/tools/VideoConverter'));
const VideoMerger = lazy(() => import('./pages/tools/VideoMerger'));
const VideoSubtitles = lazy(() => import('./pages/tools/VideoSubtitles'));
const ReverseVideo = lazy(() => import('./pages/tools/ReverseVideo'));

const AudioTrimmer = lazy(() => import('./pages/tools/AudioTrimmer'));
const AudioConverter = lazy(() => import('./pages/tools/AudioConverter'));
const AudioCompressor = lazy(() => import('./pages/tools/AudioCompressor'));
const AudioMerger = lazy(() => import('./pages/tools/AudioMerger'));
const VoiceRecorder = lazy(() => import('./pages/tools/VoiceRecorder'));
const AudioVolume = lazy(() => import('./pages/tools/AudioVolume'));

const ColorPicker = lazy(() => import('./pages/tools/ColorPicker'));
const PaletteGenerator = lazy(() => import('./pages/tools/PaletteGenerator'));
const GradientGenerator = lazy(() => import('./pages/tools/GradientGenerator'));
const ContrastChecker = lazy(() => import('./pages/tools/ContrastChecker'));
const ColorConverter = lazy(() => import('./pages/tools/ColorConverter'));

const AgeCalculator = lazy(() => import('./pages/tools/AgeCalculator'));
const DateDifference = lazy(() => import('./pages/tools/DateDifference'));
const DayFinder = lazy(() => import('./pages/tools/DayFinder'));
const AddSubtractDays = lazy(() => import('./pages/tools/AddSubtractDays'));
const StopwatchCountdown = lazy(() => import('./pages/tools/StopwatchCountdown'));

const PasswordGenerator = lazy(() => import('./pages/tools/PasswordGenerator'));
const PasswordStrength = lazy(() => import('./pages/tools/PasswordStrength'));
const RandomDice = lazy(() => import('./pages/tools/RandomDice'));
const PickRandom = lazy(() => import('./pages/tools/PickRandom'));
const BcryptGenerator = lazy(() => import('./pages/tools/BcryptGenerator'));
const HmacGenerator = lazy(() => import('./pages/tools/HmacGenerator'));
const ChecksumFile = lazy(() => import('./pages/tools/ChecksumFile'));

const LoremIpsum = lazy(() => import('./pages/tools/LoremIpsum'));
const DuplicateRemover = lazy(() => import('./pages/tools/DuplicateRemover'));
const LineShuffler = lazy(() => import('./pages/tools/LineShuffler'));
const TextToSlug = lazy(() => import('./pages/tools/TextToSlug'));
const ReverseText = lazy(() => import('./pages/tools/ReverseText'));
const CharCounter = lazy(() => import('./pages/tools/CharCounter'));
const TextRepeater = lazy(() => import('./pages/tools/TextRepeater'));
const ListSorter = lazy(() => import('./pages/tools/ListSorter'));
const SpeechToText = lazy(() => import('./pages/tools/SpeechToText'));
const FindReplace = lazy(() => import('./pages/tools/FindReplace'));

const EpubToPdf = lazy(() => import('./pages/tools/EpubToPdf'));
const PdfToEpub = lazy(() => import('./pages/tools/PdfToEpub'));
const ResizeEpub = lazy(() => import('./pages/tools/ResizeEpub'));
const RtfToPdf = lazy(() => import('./pages/tools/RtfToPdf'));

// Archive Tools
const CreateZip = lazy(() => import('./pages/tools/CreateZip'));
const ExtractArchive = lazy(() => import('./pages/tools/ExtractArchive'));
const CompressFolder = lazy(() => import('./pages/tools/CompressFolder'));
const UnzipSpecific = lazy(() => import('./pages/tools/UnzipSpecific'));

// Viral Tools
const ResumeBuilder = lazy(() => import('./pages/tools/ResumeBuilder'));
const InvoiceGenerator = lazy(() => import('./pages/tools/InvoiceGenerator'));
const CalendarGenerator = lazy(() => import('./pages/tools/CalendarGenerator'));
const QrBusinessCard = lazy(() => import('./pages/tools/QrBusinessCard'));
const SubtitleGenerator = lazy(() => import('./pages/tools/SubtitleGenerator'));
// Network Tools
const WhatsMyIp = lazy(() => import('./pages/tools/WhatsMyIp'));
const UserAgentParser = lazy(() => import('./pages/tools/UserAgentParser'));
const InternetSpeedTest = lazy(() => import('./pages/tools/InternetSpeedTest'));
const UrlParser = lazy(() => import('./pages/tools/UrlParser'));
// Social Tools
const MetaTagsPreview = lazy(() => import('./pages/tools/MetaTagsPreview'));
const YoutubeThumbnail = lazy(() => import('./pages/tools/YoutubeThumbnail'));
const HashtagGenerator = lazy(() => import('./pages/tools/HashtagGenerator'));
const EmailSignature = lazy(() => import('./pages/tools/EmailSignature'));
const QrCodeScanner = lazy(() => import('./pages/tools/QrCodeScanner'));
const BarcodeGenerator = lazy(() => import('./pages/tools/BarcodeGenerator'));
// Design Tools
const MemeGenerator = lazy(() => import('./pages/tools/MemeGenerator'));
const ImageCollage = lazy(() => import('./pages/tools/ImageCollage'));
const ImageSplitter = lazy(() => import('./pages/tools/ImageSplitter'));
const FaviconGenerator = lazy(() => import('./pages/tools/FaviconGenerator'));
const Whiteboard = lazy(() => import('./pages/tools/Whiteboard'));
const PaletteFromImage = lazy(() => import('./pages/tools/PaletteFromImage'));
// Productivity Tools
const OcrImage = lazy(() => import('./pages/tools/OcrImage'));
const HandwritingGenerator = lazy(() => import('./pages/tools/HandwritingGenerator'));
const PdfToExcel = lazy(() => import('./pages/tools/PdfToExcel'));
const ExcelToPdf = lazy(() => import('./pages/tools/ExcelToPdf'));
const MergeWord = lazy(() => import('./pages/tools/MergeWord'));
const SplitWord = lazy(() => import('./pages/tools/SplitWord'));
// Fun Tools
const WordCloud = lazy(() => import('./pages/tools/WordCloud'));
const ReadabilityScore = lazy(() => import('./pages/tools/ReadabilityScore'));
const CharFrequency = lazy(() => import('./pages/tools/CharFrequency'));
const SpinWheel = lazy(() => import('./pages/tools/SpinWheel'));
const RandomNamePicker = lazy(() => import('./pages/tools/RandomNamePicker'));
// Extra Audio/Video
const ScreenRecorder = lazy(() => import('./pages/tools/ScreenRecorder'));
const WebcamRecorder = lazy(() => import('./pages/tools/WebcamRecorder'));
const KaraokeRecorder = lazy(() => import('./pages/tools/KaraokeRecorder'));
const PomodoroTimer = lazy(() => import('./pages/tools/PomodoroTimer'));
const HttpHeaderViewer = lazy(() => import('./pages/tools/HttpHeaderViewer'));

// --- GAMES SECTION LAZY IMPORTS ---
const WordleGame = lazy(() => import('./pages/tools/WordleGame'));
const Game2048 = lazy(() => import('./pages/tools/Game2048'));
const SudokuGame = lazy(() => import('./pages/tools/SudokuGame'));
const MinesweeperGame = lazy(() => import('./pages/tools/MinesweeperGame'));
const ChessGame = lazy(() => import('./pages/tools/ChessGame'));
const CheckersGame = lazy(() => import('./pages/tools/CheckersGame'));
const MemoryCardFlip = lazy(() => import('./pages/tools/MemoryCardFlip'));
const SnakeGame = lazy(() => import('./pages/tools/SnakeGame'));
const TetrisGame = lazy(() => import('./pages/tools/TetrisGame'));
const TicTacToe = lazy(() => import('./pages/tools/TicTacToe'));
const SlidingPuzzle = lazy(() => import('./pages/tools/SlidingPuzzle'));
const TypingSpeedTest = lazy(() => import('./pages/tools/TypingSpeedTest'));
const MathSpeedChallenge = lazy(() => import('./pages/tools/MathSpeedChallenge'));
const FlagQuiz = lazy(() => import('./pages/tools/FlagQuiz'));
const ReactionTimeTester = lazy(() => import('./pages/tools/ReactionTimeTester'));
const ColorMemoryGame = lazy(() => import('./pages/tools/ColorMemoryGame'));
const GeographyQuiz = lazy(() => import('./pages/tools/GeographyQuiz'));
const FlappyBirdClone = lazy(() => import('./pages/tools/FlappyBirdClone'));
const DinoRunGame = lazy(() => import('./pages/tools/DinoRunGame'));
const RockPaperScissors = lazy(() => import('./pages/tools/RockPaperScissors'));
const CookieClicker = lazy(() => import('./pages/tools/CookieClicker'));
const TriviaQuiz = lazy(() => import('./pages/tools/TriviaQuiz'));
const DrawAndGuess = lazy(() => import('./pages/tools/DrawAndGuess'));
const MultiplayerLobby = lazy(() => import('./pages/tools/MultiplayerLobby'));


// --- LANGUAGE SECTION LAZY IMPORTS ---
const TextTranslator = lazy(() => import('./pages/tools/TextTranslator'));
const LanguageDetector = lazy(() => import('./pages/tools/LanguageDetector'));
const PinyinConverter = lazy(() => import('./pages/tools/PinyinConverter'));
const FuriganaGenerator = lazy(() => import('./pages/tools/FuriganaGenerator'));
const MorseCodeTranslator = lazy(() => import('./pages/tools/MorseCodeTranslator'));
const NumberToWords = lazy(() => import('./pages/tools/NumberToWords'));
const ChineseCharCounter = lazy(() => import('./pages/tools/ChineseCharCounter'));
const BinaryHexConverter = lazy(() => import('./pages/tools/BinaryHexConverter'));
const RomajiConverter = lazy(() => import('./pages/tools/RomajiConverter'));

// --- MATH SECTION LAZY IMPORTS ---
const ScientificCalculator = lazy(() => import('./pages/tools/ScientificCalculator'));
const FractionCalculator = lazy(() => import('./pages/tools/FractionCalculator'));
const LcmGcdCalculator = lazy(() => import('./pages/tools/LcmGcdCalculator'));
const PrimeChecker = lazy(() => import('./pages/tools/PrimeChecker'));
const MatrixCalculator = lazy(() => import('./pages/tools/MatrixCalculator'));
const QuadraticSolver = lazy(() => import('./pages/tools/QuadraticSolver'));
const StatisticsCalculator = lazy(() => import('./pages/tools/StatisticsCalculator'));
const NumberBaseConverter = lazy(() => import('./pages/tools/NumberBaseConverter'));
const GstTaxCalculator = lazy(() => import('./pages/tools/GstTaxCalculator'));
const FuelCalculator = lazy(() => import('./pages/tools/FuelCalculator'));

// --- HEALTH SECTION LAZY IMPORTS ---
const CalorieCalculator = lazy(() => import('./pages/tools/CalorieCalculator'));
const BodyFatCalculator = lazy(() => import('./pages/tools/BodyFatCalculator'));
const WaterIntakeCalculator = lazy(() => import('./pages/tools/WaterIntakeCalculator'));
const PregnancyCalculator = lazy(() => import('./pages/tools/PregnancyCalculator'));
const OvulationCalculator = lazy(() => import('./pages/tools/OvulationCalculator'));
const BloodPressureChecker = lazy(() => import('./pages/tools/BloodPressureChecker'));
const HeartRateZones = lazy(() => import('./pages/tools/HeartRateZones'));

// --- FINANCE SECTION LAZY IMPORTS ---
const InterestCalculator = lazy(() => import('./pages/tools/InterestCalculator'));
const SipCalculator = lazy(() => import('./pages/tools/SipCalculator'));
const RoiCalculator = lazy(() => import('./pages/tools/RoiCalculator'));
const BudgetPlanner = lazy(() => import('./pages/tools/BudgetPlanner'));

// --- IMAGE EXTRAS LAZY IMPORTS ---
const PencilSketch = lazy(() => import('./pages/tools/PencilSketch'));
const PassportPhoto = lazy(() => import('./pages/tools/PassportPhoto'));
const ImageBorderFrame = lazy(() => import('./pages/tools/ImageBorderFrame'));
const ScreenshotToPdf = lazy(() => import('./pages/tools/ScreenshotToPdf'));
const HeicToJpg = lazy(() => import('./pages/tools/HeicToJpg'));
const SvgToPng = lazy(() => import('./pages/tools/SvgToPng'));

// --- UNIT CONVERTERS LAZY IMPORTS ---
const DataStorageConverter = lazy(() => import('./pages/tools/DataStorageConverter'));
const CookingConverter = lazy(() => import('./pages/tools/CookingConverter'));
const ShoeSizeConverter = lazy(() => import('./pages/tools/ShoeSizeConverter'));
const ClothingSizeConverter = lazy(() => import('./pages/tools/ClothingSizeConverter'));

// --- WRITING LAZY IMPORTS ---
const CoverLetterTemplate = lazy(() => import('./pages/tools/CoverLetterTemplate'));
const HaikuGenerator = lazy(() => import('./pages/tools/HaikuGenerator'));
const DuplicateSentenceFinder = lazy(() => import('./pages/tools/DuplicateSentenceFinder'));

// --- EDUCATION LAZY IMPORTS ---
const CitationGenerator = lazy(() => import('./pages/tools/CitationGenerator'));
const FlashcardMaker = lazy(() => import('./pages/tools/FlashcardMaker'));
const QuizMaker = lazy(() => import('./pages/tools/QuizMaker'));
const ExamCountdown = lazy(() => import('./pages/tools/ExamCountdown'));
const EssayOutline = lazy(() => import('./pages/tools/EssayOutline'));
const PeriodicTable = lazy(() => import('./pages/tools/PeriodicTable'));
const MultiplicationTable = lazy(() => import('./pages/tools/MultiplicationTable'));
const StudyTimetable = lazy(() => import('./pages/tools/StudyTimetable'));
const VennDiagram = lazy(() => import('./pages/tools/VennDiagram'));
const PlagiarismChecker = lazy(() => import('./pages/tools/PlagiarismChecker'));

// --- HOUSEHOLD LAZY IMPORTS ---
const ShoppingList = lazy(() => import('./pages/tools/ShoppingList'));
const BillSplitter = lazy(() => import('./pages/tools/BillSplitter'));
const RentVsBuy = lazy(() => import('./pages/tools/RentVsBuy'));
const MovingChecklist = lazy(() => import('./pages/tools/MovingChecklist'));
const PackingList = lazy(() => import('./pages/tools/PackingList'));
const UtilityCostEstimator = lazy(() => import('./pages/tools/UtilityCostEstimator'));
const PetAgeCalculator = lazy(() => import('./pages/tools/PetAgeCalculator'));
const BabyNameGenerator = lazy(() => import('./pages/tools/BabyNameGenerator'));
const ChoreChart = lazy(() => import('./pages/tools/ChoreChart'));

// --- TRAVEL LAZY IMPORTS ---
const FlightDuration = lazy(() => import('./pages/tools/FlightDuration'));
const VisaChecker = lazy(() => import('./pages/tools/VisaChecker'));
const PlugTypeChecker = lazy(() => import('./pages/tools/PlugTypeChecker'));
const HolidayChecker = lazy(() => import('./pages/tools/HolidayChecker'));
const CityDistance = lazy(() => import('./pages/tools/CityDistance'));
const MeetingPlanner = lazy(() => import('./pages/tools/MeetingPlanner'));

// --- BUSINESS LAZY IMPORTS ---
const FreelanceRate = lazy(() => import('./pages/tools/FreelanceRate'));
const ProposalGenerator = lazy(() => import('./pages/tools/ProposalGenerator'));
const TimeTracker = lazy(() => import('./pages/tools/TimeTracker'));
const WorkHours = lazy(() => import('./pages/tools/WorkHours'));
const BreakEven = lazy(() => import('./pages/tools/BreakEven'));
const BusinessNameGenerator = lazy(() => import('./pages/tools/BusinessNameGenerator'));
const SloganGenerator = lazy(() => import('./pages/tools/SloganGenerator'));
const EmailSubjectTester = lazy(() => import('./pages/tools/EmailSubjectTester'));
const ContractTemplate = lazy(() => import('./pages/tools/ContractTemplate'));

// --- SCIENCE LAZY IMPORTS ---
const OhmsLaw = lazy(() => import('./pages/tools/OhmsLaw'));
const ResistorCalculator = lazy(() => import('./pages/tools/ResistorCalculator'));
const TruthTable = lazy(() => import('./pages/tools/TruthTable'));
const SigFigs = lazy(() => import('./pages/tools/SigFigs'));
const ScientificNotation = lazy(() => import('./pages/tools/ScientificNotation'));
const HalfLife = lazy(() => import('./pages/tools/HalfLife'));
const PhCalculator = lazy(() => import('./pages/tools/PhCalculator'));
const MolarMass = lazy(() => import('./pages/tools/MolarMass'));
const ProjectileMotion = lazy(() => import('./pages/tools/ProjectileMotion'));
const RomanNumeral = lazy(() => import('./pages/tools/RomanNumeral'));

// --- DATA & SPREADSHEET LAZY IMPORTS ---
const SpreadsheetEditor = lazy(() => import('./pages/tools/SpreadsheetEditor'));
const ChartGenerator = lazy(() => import('./pages/tools/ChartGenerator'));
const SqlFormatter = lazy(() => import('./pages/tools/SqlFormatter'));

// --- PROFESSIONAL DOCS LAZY IMPORTS ---
const ReferenceLetter = lazy(() => import('./pages/tools/ReferenceLetter'));
const MeetingMinutes = lazy(() => import('./pages/tools/MeetingMinutes'));
const RentReceipt = lazy(() => import('./pages/tools/RentReceipt'));
const SalarySlip = lazy(() => import('./pages/tools/SalarySlip'));
const AttendanceSheet = lazy(() => import('./pages/tools/AttendanceSheet'));

// --- GEOGRAPHY LAZY IMPORTS ---
const LatLongFinder = lazy(() => import('./pages/tools/LatLongFinder'));
const GpsDistance = lazy(() => import('./pages/tools/GpsDistance'));
const WorldClock = lazy(() => import('./pages/tools/WorldClock'));
const SunriseSunset = lazy(() => import('./pages/tools/SunriseSunset'));
const MoonPhase = lazy(() => import('./pages/tools/MoonPhase'));

// --- FUN & VIRAL LAZY IMPORTS ---
const ChineseZodiac = lazy(() => import('./pages/tools/ChineseZodiac'));
const NumerologyCalculator = lazy(() => import('./pages/tools/NumerologyCalculator'));
const LoveCompatibility = lazy(() => import('./pages/tools/LoveCompatibility'));
const LifePathNumber = lazy(() => import('./pages/tools/LifePathNumber'));
const AgeInDays = lazy(() => import('./pages/tools/AgeInDays'));
const ReadingSpeedTest = lazy(() => import('./pages/tools/ReadingSpeedTest'));

// --- PLANNING LAZY IMPORTS ---
const HabitTracker = lazy(() => import('./pages/tools/HabitTracker'));
const DailyJournal = lazy(() => import('./pages/tools/DailyJournal'));
const WeeklyPlanner = lazy(() => import('./pages/tools/WeeklyPlanner'));
const MealPlanner = lazy(() => import('./pages/tools/MealPlanner'));

// --- HEALTH EXTRAS LAZY IMPORTS ---
const SleepCalculator = lazy(() => import('./pages/tools/SleepCalculator'));
const CaffeineCalculator = lazy(() => import('./pages/tools/CaffeineCalculator'));
const RetirementCalculator = lazy(() => import('./pages/tools/RetirementCalculator'));

// --- WELLNESS LAZY IMPORTS ---
const AmbientSoundMixer = lazy(() => import('./pages/tools/AmbientSoundMixer'));
const BreathingExercise = lazy(() => import('./pages/tools/BreathingExercise'));
const EyeRestTimer = lazy(() => import('./pages/tools/EyeRestTimer'));
const AffirmationGenerator = lazy(() => import('./pages/tools/AffirmationGenerator'));

// --- NEW DEVELOPER LAZY IMPORTS ---
const CurlGenerator = lazy(() => import('./pages/tools/CurlGenerator'));
const HttpStatusCodes = lazy(() => import('./pages/tools/HttpStatusCodes'));
const CronBuilder = lazy(() => import('./pages/tools/CronBuilder'));
const CssBoxShadow = lazy(() => import('./pages/tools/CssBoxShadow'));
const CssBorderRadius = lazy(() => import('./pages/tools/CssBorderRadius'));
const FlexboxPlayground = lazy(() => import('./pages/tools/FlexboxPlayground'));
const RobotsTxtGenerator = lazy(() => import('./pages/tools/RobotsTxtGenerator'));
const ImageToPdf = lazy(() => import('./pages/tools/ImageToPdf'));

function LazyLoad({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><span className="text-muted-foreground">Loading tool...</span></div>}>
      {children}
    </Suspense>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const cleanup = setupGlobalPreloader();
    return cleanup;
  }, []);

  return (
    <TransitionProvider>
      <PageTransition>
        <Routes>
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/:category" element={<AppLayout><CategoryPage /></AppLayout>} />
        <Route path="/search" element={<AppLayout><SearchPage /></AppLayout>} />
        <Route path="/tools" element={<AppLayout><AllToolsPage /></AppLayout>} />
        <Route path="/favorites" element={<AppLayout><FavoritesPage /></AppLayout>} />
        <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
        <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />

        {/* PDF Tools */}
        <Route path="/tools/merge-pdf" element={<AppLayout><MergePdf /></AppLayout>} />
        <Route path="/tools/split-pdf" element={<AppLayout><SplitPdf /></AppLayout>} />
        <Route path="/tools/compress-pdf" element={<AppLayout><CompressPdf /></AppLayout>} />
        <Route path="/tools/pdf-to-word" element={<AppLayout><PdfToWord /></AppLayout>} />
        <Route path="/tools/ocr-pdf" element={<AppLayout><OcrPdf /></AppLayout>} />
        <Route path="/tools/esign-pdf" element={<AppLayout><EsignPdf /></AppLayout>} />
        <Route path="/tools/unlock-pdf" element={<AppLayout><UnlockPdf /></AppLayout>} />
        <Route path="/tools/rotate-pdf" element={<AppLayout><RotatePdf /></AppLayout>} />
        <Route path="/tools/watermark-pdf" element={<AppLayout><WatermarkPdf /></AppLayout>} />
        <Route path="/tools/pdf-to-jpg" element={<AppLayout><LazyLoad><PdfToJpg /></LazyLoad></AppLayout>} />
        <Route path="/tools/word-to-pdf" element={<AppLayout><LazyLoad><WordToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/powerpoint-to-pdf" element={<AppLayout><LazyLoad><PowerpointToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/pdf-to-powerpoint" element={<AppLayout><LazyLoad><PdfToPowerpoint /></LazyLoad></AppLayout>} />
        <Route path="/tools/jpg-to-pdf" element={<AppLayout><LazyLoad><JpgToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/html-to-pdf" element={<AppLayout><LazyLoad><HtmlToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/edit-pdf" element={<AppLayout><LazyLoad><EditPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/protect-pdf" element={<AppLayout><LazyLoad><ProtectPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/organize-pdf" element={<AppLayout><LazyLoad><OrganizePdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/page-numbers" element={<AppLayout><LazyLoad><PageNumbers /></LazyLoad></AppLayout>} />
        <Route path="/tools/crop-pdf" element={<AppLayout><LazyLoad><CropPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/compare-pdf" element={<AppLayout><LazyLoad><ComparePdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/redact-pdf" element={<AppLayout><LazyLoad><RedactPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/repair-pdf" element={<AppLayout><LazyLoad><RepairPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/pdf-to-pdfa" element={<AppLayout><LazyLoad><PdfToPdfA /></LazyLoad></AppLayout>} />
        <Route path="/tools/pdf-forms" element={<AppLayout><LazyLoad><PdfForms /></LazyLoad></AppLayout>} />
        <Route path="/tools/ai-summarizer" element={<AppLayout><LazyLoad><AiSummarizer /></LazyLoad></AppLayout>} />
        <Route path="/tools/translate-pdf" element={<AppLayout><LazyLoad><TranslatePdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/scan-to-pdf" element={<AppLayout><LazyLoad><ScanToPdf /></LazyLoad></AppLayout>} />

        {/* Image Tools */}
        <Route path="/tools/compress-image" element={<AppLayout><CompressImage /></AppLayout>} />
        <Route path="/tools/resize-image" element={<AppLayout><ResizeImage /></AppLayout>} />
        <Route path="/tools/crop-image" element={<AppLayout><CropImage /></AppLayout>} />
        <Route path="/tools/remove-background" element={<AppLayout><RemoveBg /></AppLayout>} />
        <Route path="/tools/upscale-image" element={<AppLayout><UpscaleImage /></AppLayout>} />
        <Route path="/tools/convert-image" element={<AppLayout><ConvertImage /></AppLayout>} />
        <Route path="/tools/color-correct" element={<AppLayout><ColorCorrect /></AppLayout>} />
        <Route path="/tools/watermark-image" element={<AppLayout><WatermarkImage /></AppLayout>} />

        {/* Text Tools */}
        <Route path="/tools/spell-check" element={<AppLayout><SpellCheck /></AppLayout>} />
        <Route path="/tools/paraphrase" element={<AppLayout><Paraphrase /></AppLayout>} />
        <Route path="/tools/word-counter" element={<AppLayout><WordCounter /></AppLayout>} />
        <Route path="/tools/diff-checker" element={<AppLayout><DiffChecker /></AppLayout>} />
        <Route path="/tools/case-converter" element={<AppLayout><CaseConverter /></AppLayout>} />
        <Route path="/tools/text-to-speech" element={<AppLayout><TextToSpeech /></AppLayout>} />

        {/* Spreadsheet Tools */}
        <Route path="/tools/csv-to-json" element={<AppLayout><CsvToJson /></AppLayout>} />
        <Route path="/tools/json-to-csv" element={<AppLayout><JsonToCsv /></AppLayout>} />
        <Route path="/tools/csv-to-xml" element={<AppLayout><CsvToXml /></AppLayout>} />
        <Route path="/tools/csv-to-sql" element={<AppLayout><CsvToSql /></AppLayout>} />
        <Route path="/tools/merge-csv" element={<AppLayout><MergeCsv /></AppLayout>} />
        <Route path="/tools/split-csv" element={<AppLayout><SplitCsv /></AppLayout>} />
        <Route path="/tools/fake-data" element={<AppLayout><FakeData /></AppLayout>} />

        {/* Calculator Tools */}
        <Route path="/tools/currency-converter" element={<AppLayout><CurrencyConverter /></AppLayout>} />
        <Route path="/tools/timezone-converter" element={<AppLayout><TimezoneConverter /></AppLayout>} />
        <Route path="/tools/unit-converter" element={<AppLayout><UnitConverter /></AppLayout>} />
        <Route path="/tools/percentage-calculator" element={<AppLayout><PercentageCalculator /></AppLayout>} />
        <Route path="/tools/tip-calculator" element={<AppLayout><TipCalculator /></AppLayout>} />
        <Route path="/tools/bmi-calculator" element={<AppLayout><BmiCalculator /></AppLayout>} />
        <Route path="/tools/loan-calculator" element={<AppLayout><LoanCalculator /></AppLayout>} />

        {/* Resize Tools */}
        <Route path="/tools/resize-by-dimensions" element={<AppLayout><ResizeByDimensions /></AppLayout>} />
        <Route path="/tools/social-media-resize" element={<AppLayout><SocialMediaResize /></AppLayout>} />

        {/* Enhancer Tools */}
        <Route path="/tools/ai-upscale" element={<AppLayout><AiUpscale /></AppLayout>} />
        <Route path="/tools/enhancer-remove-bg" element={<AppLayout><RemoveBgPro /></AppLayout>} />
        <Route path="/tools/sharpen" element={<AppLayout><Sharpen /></AppLayout>} />
        <Route path="/tools/art-filters" element={<AppLayout><ArtFilters /></AppLayout>} />

        {/* Developer & Code Tools */}
        <Route path="/tools/json-formatter" element={<AppLayout><LazyLoad><JsonFormatter /></LazyLoad></AppLayout>} />
        <Route path="/tools/xml-formatter" element={<AppLayout><LazyLoad><XmlFormatter /></LazyLoad></AppLayout>} />
        <Route path="/tools/base64-encoder" element={<AppLayout><LazyLoad><Base64Encoder /></LazyLoad></AppLayout>} />
        <Route path="/tools/url-encoder" element={<AppLayout><LazyLoad><UrlEncoder /></LazyLoad></AppLayout>} />
        <Route path="/tools/html-encoder" element={<AppLayout><LazyLoad><HtmlEncoder /></LazyLoad></AppLayout>} />
        <Route path="/tools/qr-code-generator" element={<AppLayout><LazyLoad><QrCodeGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/uuid-generator" element={<AppLayout><LazyLoad><UuidGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/jwt-decoder" element={<AppLayout><LazyLoad><JwtDecoder /></LazyLoad></AppLayout>} />
        <Route path="/tools/hash-generator" element={<AppLayout><LazyLoad><HashGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/regex-tester" element={<AppLayout><LazyLoad><RegexTester /></LazyLoad></AppLayout>} />
        <Route path="/tools/code-minifier" element={<AppLayout><LazyLoad><CodeMinifier /></LazyLoad></AppLayout>} />
        <Route path="/tools/markdown-converter" element={<AppLayout><LazyLoad><MarkdownConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/unix-timestamp" element={<AppLayout><LazyLoad><UnixTimestamp /></LazyLoad></AppLayout>} />
        <Route path="/tools/json-to-yaml" element={<AppLayout><LazyLoad><JsonToYaml /></LazyLoad></AppLayout>} />
        <Route path="/tools/css-beautifier" element={<AppLayout><LazyLoad><CssBeautifier /></LazyLoad></AppLayout>} />

        {/* Video Tools */}
        <Route path="/tools/video-compressor" element={<AppLayout><LazyLoad><VideoCompressor /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-trimmer" element={<AppLayout><LazyLoad><VideoTrimmer /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-to-gif" element={<AppLayout><LazyLoad><VideoToGif /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-to-audio" element={<AppLayout><LazyLoad><VideoToAudio /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-converter" element={<AppLayout><LazyLoad><VideoConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-merger" element={<AppLayout><LazyLoad><VideoMerger /></LazyLoad></AppLayout>} />
        <Route path="/tools/video-subtitles" element={<AppLayout><LazyLoad><VideoSubtitles /></LazyLoad></AppLayout>} />
        <Route path="/tools/reverse-video" element={<AppLayout><LazyLoad><ReverseVideo /></LazyLoad></AppLayout>} />

        {/* Audio Tools */}
        <Route path="/tools/audio-trimmer" element={<AppLayout><LazyLoad><AudioTrimmer /></LazyLoad></AppLayout>} />
        <Route path="/tools/audio-converter" element={<AppLayout><LazyLoad><AudioConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/audio-compressor" element={<AppLayout><LazyLoad><AudioCompressor /></LazyLoad></AppLayout>} />
        <Route path="/tools/audio-merger" element={<AppLayout><LazyLoad><AudioMerger /></LazyLoad></AppLayout>} />
        <Route path="/tools/voice-recorder" element={<AppLayout><LazyLoad><VoiceRecorder /></LazyLoad></AppLayout>} />
        <Route path="/tools/audio-volume" element={<AppLayout><LazyLoad><AudioVolume /></LazyLoad></AppLayout>} />

        {/* Color Tools */}
        <Route path="/tools/color-picker" element={<AppLayout><LazyLoad><ColorPicker /></LazyLoad></AppLayout>} />
        <Route path="/tools/palette-generator" element={<AppLayout><LazyLoad><PaletteGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/gradient-generator" element={<AppLayout><LazyLoad><GradientGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/contrast-checker" element={<AppLayout><LazyLoad><ContrastChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/color-converter" element={<AppLayout><LazyLoad><ColorConverter /></LazyLoad></AppLayout>} />

        {/* Date & Time Tools */}
        <Route path="/tools/age-calculator" element={<AppLayout><LazyLoad><AgeCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/date-difference" element={<AppLayout><LazyLoad><DateDifference /></LazyLoad></AppLayout>} />
        <Route path="/tools/day-finder" element={<AppLayout><LazyLoad><DayFinder /></LazyLoad></AppLayout>} />
        <Route path="/tools/add-subtract-days" element={<AppLayout><LazyLoad><AddSubtractDays /></LazyLoad></AppLayout>} />
        <Route path="/tools/stopwatch-countdown" element={<AppLayout><LazyLoad><StopwatchCountdown /></LazyLoad></AppLayout>} />

        {/* Security Tools */}
        <Route path="/tools/password-generator" element={<AppLayout><LazyLoad><PasswordGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/password-strength" element={<AppLayout><LazyLoad><PasswordStrength /></LazyLoad></AppLayout>} />
        <Route path="/tools/random-dice" element={<AppLayout><LazyLoad><RandomDice /></LazyLoad></AppLayout>} />
        <Route path="/tools/pick-random" element={<AppLayout><LazyLoad><PickRandom /></LazyLoad></AppLayout>} />
        <Route path="/tools/bcrypt-generator" element={<AppLayout><LazyLoad><BcryptGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/hmac-generator" element={<AppLayout><LazyLoad><HmacGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/checksum-file" element={<AppLayout><LazyLoad><ChecksumFile /></LazyLoad></AppLayout>} />

        {/* Extended Text Tools */}
        <Route path="/tools/lorem-ipsum" element={<AppLayout><LazyLoad><LoremIpsum /></LazyLoad></AppLayout>} />
        <Route path="/tools/duplicate-remover" element={<AppLayout><LazyLoad><DuplicateRemover /></LazyLoad></AppLayout>} />
        <Route path="/tools/line-shuffler" element={<AppLayout><LazyLoad><LineShuffler /></LazyLoad></AppLayout>} />
        <Route path="/tools/text-to-slug" element={<AppLayout><LazyLoad><TextToSlug /></LazyLoad></AppLayout>} />
        <Route path="/tools/reverse-text" element={<AppLayout><LazyLoad><ReverseText /></LazyLoad></AppLayout>} />
        <Route path="/tools/char-counter" element={<AppLayout><LazyLoad><CharCounter /></LazyLoad></AppLayout>} />
        <Route path="/tools/text-repeater" element={<AppLayout><LazyLoad><TextRepeater /></LazyLoad></AppLayout>} />
        <Route path="/tools/list-sorter" element={<AppLayout><LazyLoad><ListSorter /></LazyLoad></AppLayout>} />
        <Route path="/tools/speech-to-text" element={<AppLayout><LazyLoad><SpeechToText /></LazyLoad></AppLayout>} />
        <Route path="/tools/find-replace" element={<AppLayout><LazyLoad><FindReplace /></LazyLoad></AppLayout>} />

        {/* Document & Ebook Tools */}
        <Route path="/tools/epub-to-pdf" element={<AppLayout><LazyLoad><EpubToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/pdf-to-epub" element={<AppLayout><LazyLoad><PdfToEpub /></LazyLoad></AppLayout>} />
        <Route path="/tools/resize-epub" element={<AppLayout><LazyLoad><ResizeEpub /></LazyLoad></AppLayout>} />
        <Route path="/tools/rtf-to-pdf" element={<AppLayout><LazyLoad><RtfToPdf /></LazyLoad></AppLayout>} />

        {/* Archive Tools */}
        <Route path="/tools/create-zip" element={<AppLayout><LazyLoad><CreateZip /></LazyLoad></AppLayout>} />
        <Route path="/tools/extract-archive" element={<AppLayout><LazyLoad><ExtractArchive /></LazyLoad></AppLayout>} />
        <Route path="/tools/compress-folder" element={<AppLayout><LazyLoad><CompressFolder /></LazyLoad></AppLayout>} />
        <Route path="/tools/unzip-specific" element={<AppLayout><LazyLoad><UnzipSpecific /></LazyLoad></AppLayout>} />

        {/* Network Tools */}
        <Route path="/tools/whats-my-ip" element={<AppLayout><LazyLoad><WhatsMyIp /></LazyLoad></AppLayout>} />
        <Route path="/tools/user-agent-parser" element={<AppLayout><LazyLoad><UserAgentParser /></LazyLoad></AppLayout>} />
        <Route path="/tools/internet-speed-test" element={<AppLayout><LazyLoad><InternetSpeedTest /></LazyLoad></AppLayout>} />
        <Route path="/tools/url-parser" element={<AppLayout><LazyLoad><UrlParser /></LazyLoad></AppLayout>} />

        {/* Social Tools */}
        <Route path="/tools/meta-tags-preview" element={<AppLayout><LazyLoad><MetaTagsPreview /></LazyLoad></AppLayout>} />
        <Route path="/tools/youtube-thumbnail" element={<AppLayout><LazyLoad><YoutubeThumbnail /></LazyLoad></AppLayout>} />
        <Route path="/tools/hashtag-generator" element={<AppLayout><LazyLoad><HashtagGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/email-signature" element={<AppLayout><LazyLoad><EmailSignature /></LazyLoad></AppLayout>} />
        <Route path="/tools/qr-code-scanner" element={<AppLayout><LazyLoad><QrCodeScanner /></LazyLoad></AppLayout>} />
        <Route path="/tools/barcode-generator" element={<AppLayout><LazyLoad><BarcodeGenerator /></LazyLoad></AppLayout>} />

        {/* Design Tools */}
        <Route path="/tools/meme-generator" element={<AppLayout><LazyLoad><MemeGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/image-collage" element={<AppLayout><LazyLoad><ImageCollage /></LazyLoad></AppLayout>} />
        <Route path="/tools/image-splitter" element={<AppLayout><LazyLoad><ImageSplitter /></LazyLoad></AppLayout>} />
        <Route path="/tools/favicon-generator" element={<AppLayout><LazyLoad><FaviconGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/whiteboard" element={<AppLayout><LazyLoad><Whiteboard /></LazyLoad></AppLayout>} />
        <Route path="/tools/palette-from-image" element={<AppLayout><LazyLoad><PaletteFromImage /></LazyLoad></AppLayout>} />

        {/* Productivity Tools */}
        <Route path="/tools/ocr-image" element={<AppLayout><LazyLoad><OcrImage /></LazyLoad></AppLayout>} />
        <Route path="/tools/handwriting-generator" element={<AppLayout><LazyLoad><HandwritingGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/pdf-to-excel" element={<AppLayout><LazyLoad><PdfToExcel /></LazyLoad></AppLayout>} />
        <Route path="/tools/excel-to-pdf" element={<AppLayout><LazyLoad><ExcelToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/merge-word" element={<AppLayout><LazyLoad><MergeWord /></LazyLoad></AppLayout>} />
        <Route path="/tools/split-word" element={<AppLayout><LazyLoad><SplitWord /></LazyLoad></AppLayout>} />

        {/* Fun Tools */}
        <Route path="/tools/word-cloud" element={<AppLayout><LazyLoad><WordCloud /></LazyLoad></AppLayout>} />
        <Route path="/tools/readability-score" element={<AppLayout><LazyLoad><ReadabilityScore /></LazyLoad></AppLayout>} />
        <Route path="/tools/char-frequency" element={<AppLayout><LazyLoad><CharFrequency /></LazyLoad></AppLayout>} />
        <Route path="/tools/spin-wheel" element={<AppLayout><LazyLoad><SpinWheel /></LazyLoad></AppLayout>} />
        <Route path="/tools/random-name-picker" element={<AppLayout><LazyLoad><RandomNamePicker /></LazyLoad></AppLayout>} />

        {/* Extra Audio/Video Tools */}
        <Route path="/tools/screen-recorder" element={<AppLayout><LazyLoad><ScreenRecorder /></LazyLoad></AppLayout>} />
        <Route path="/tools/webcam-recorder" element={<AppLayout><LazyLoad><WebcamRecorder /></LazyLoad></AppLayout>} />
        <Route path="/tools/karaoke-recorder" element={<AppLayout><LazyLoad><KaraokeRecorder /></LazyLoad></AppLayout>} />

        {/* Fun Tools */}
        <Route path="/tools/pomodoro-timer" element={<AppLayout><LazyLoad><PomodoroTimer /></LazyLoad></AppLayout>} />

        {/* Network Tools - continued */}
        <Route path="/tools/http-header-viewer" element={<AppLayout><LazyLoad><HttpHeaderViewer /></LazyLoad></AppLayout>} />

        {/* Viral Tools */}
        <Route path="/tools/resume-builder" element={<AppLayout><LazyLoad><ResumeBuilder /></LazyLoad></AppLayout>} />
        <Route path="/tools/invoice-generator" element={<AppLayout><LazyLoad><InvoiceGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/calendar-generator" element={<AppLayout><LazyLoad><CalendarGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/qr-business-card" element={<AppLayout><LazyLoad><QrBusinessCard /></LazyLoad></AppLayout>} />
        <Route path="/tools/subtitle-generator" element={<AppLayout><LazyLoad><SubtitleGenerator /></LazyLoad></AppLayout>} />

        {/* --- GAMES --- */}
        <Route path="/games/wordle" element={<AppLayout><LazyLoad><WordleGame /></LazyLoad></AppLayout>} />
        <Route path="/games/2048" element={<AppLayout><LazyLoad><Game2048 /></LazyLoad></AppLayout>} />
        <Route path="/games/sudoku" element={<AppLayout><LazyLoad><SudokuGame /></LazyLoad></AppLayout>} />
        <Route path="/games/minesweeper" element={<AppLayout><LazyLoad><MinesweeperGame /></LazyLoad></AppLayout>} />
        <Route path="/games/chess" element={<AppLayout><LazyLoad><ChessGame /></LazyLoad></AppLayout>} />
        <Route path="/games/checkers" element={<AppLayout><LazyLoad><CheckersGame /></LazyLoad></AppLayout>} />
        <Route path="/games/memory" element={<AppLayout><LazyLoad><MemoryCardFlip /></LazyLoad></AppLayout>} />
        <Route path="/games/snake" element={<AppLayout><LazyLoad><SnakeGame /></LazyLoad></AppLayout>} />
        <Route path="/games/tetris" element={<AppLayout><LazyLoad><TetrisGame /></LazyLoad></AppLayout>} />
        <Route path="/games/tic-tac-toe" element={<AppLayout><LazyLoad><TicTacToe /></LazyLoad></AppLayout>} />
        <Route path="/games/15-puzzle" element={<AppLayout><LazyLoad><SlidingPuzzle /></LazyLoad></AppLayout>} />
        <Route path="/games/typing-test" element={<AppLayout><LazyLoad><TypingSpeedTest /></LazyLoad></AppLayout>} />
        <Route path="/games/math-challenge" element={<AppLayout><LazyLoad><MathSpeedChallenge /></LazyLoad></AppLayout>} />
        <Route path="/games/flag-quiz" element={<AppLayout><LazyLoad><FlagQuiz /></LazyLoad></AppLayout>} />
        <Route path="/games/reaction-time" element={<AppLayout><LazyLoad><ReactionTimeTester /></LazyLoad></AppLayout>} />
        <Route path="/games/simon-says" element={<AppLayout><LazyLoad><ColorMemoryGame /></LazyLoad></AppLayout>} />
        <Route path="/games/geography-quiz" element={<AppLayout><LazyLoad><GeographyQuiz /></LazyLoad></AppLayout>} />
        <Route path="/games/flappy-bird" element={<AppLayout><LazyLoad><FlappyBirdClone /></LazyLoad></AppLayout>} />
        <Route path="/games/dino-run" element={<AppLayout><LazyLoad><DinoRunGame /></LazyLoad></AppLayout>} />
        <Route path="/games/rock-paper-scissors" element={<AppLayout><LazyLoad><RockPaperScissors /></LazyLoad></AppLayout>} />
        <Route path="/games/cookie-clicker" element={<AppLayout><LazyLoad><CookieClicker /></LazyLoad></AppLayout>} />
        <Route path="/games/trivia" element={<AppLayout><LazyLoad><TriviaQuiz /></LazyLoad></AppLayout>} />
        <Route path="/games/draw-and-guess" element={<AppLayout><LazyLoad><DrawAndGuess /></LazyLoad></AppLayout>} />
        <Route path="/games/multiplayer" element={<AppLayout><LazyLoad><MultiplayerLobby /></LazyLoad></AppLayout>} />

        {/* --- LANGUAGE --- */}
        <Route path="/tools/text-translator" element={<AppLayout><LazyLoad><TextTranslator /></LazyLoad></AppLayout>} />
        <Route path="/tools/language-detector" element={<AppLayout><LazyLoad><LanguageDetector /></LazyLoad></AppLayout>} />
        <Route path="/tools/pinyin-converter" element={<AppLayout><LazyLoad><PinyinConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/furigana-generator" element={<AppLayout><LazyLoad><FuriganaGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/morse-code" element={<AppLayout><LazyLoad><MorseCodeTranslator /></LazyLoad></AppLayout>} />
        <Route path="/tools/number-to-words" element={<AppLayout><LazyLoad><NumberToWords /></LazyLoad></AppLayout>} />
        <Route path="/tools/chinese-char-counter" element={<AppLayout><LazyLoad><ChineseCharCounter /></LazyLoad></AppLayout>} />
        <Route path="/tools/binary-hex-converter" element={<AppLayout><LazyLoad><BinaryHexConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/romaji-converter" element={<AppLayout><LazyLoad><RomajiConverter /></LazyLoad></AppLayout>} />

        {/* --- MATH --- */}
        <Route path="/tools/scientific-calculator" element={<AppLayout><LazyLoad><ScientificCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/fraction-calculator" element={<AppLayout><LazyLoad><FractionCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/lcm-gcd" element={<AppLayout><LazyLoad><LcmGcdCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/prime-checker" element={<AppLayout><LazyLoad><PrimeChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/matrix-calculator" element={<AppLayout><LazyLoad><MatrixCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/quadratic-solver" element={<AppLayout><LazyLoad><QuadraticSolver /></LazyLoad></AppLayout>} />
        <Route path="/tools/statistics-calculator" element={<AppLayout><LazyLoad><StatisticsCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/number-base-converter" element={<AppLayout><LazyLoad><NumberBaseConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/gst-tax-calculator" element={<AppLayout><LazyLoad><GstTaxCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/fuel-calculator" element={<AppLayout><LazyLoad><FuelCalculator /></LazyLoad></AppLayout>} />

        {/* --- HEALTH --- */}
        <Route path="/tools/calorie-calculator" element={<AppLayout><LazyLoad><CalorieCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/body-fat-calculator" element={<AppLayout><LazyLoad><BodyFatCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/water-intake" element={<AppLayout><LazyLoad><WaterIntakeCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/pregnancy-calculator" element={<AppLayout><LazyLoad><PregnancyCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/ovulation-calculator" element={<AppLayout><LazyLoad><OvulationCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/blood-pressure" element={<AppLayout><LazyLoad><BloodPressureChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/heart-rate-zones" element={<AppLayout><LazyLoad><HeartRateZones /></LazyLoad></AppLayout>} />

        {/* --- FINANCE --- */}
        <Route path="/tools/interest-calculator" element={<AppLayout><LazyLoad><InterestCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/sip-calculator" element={<AppLayout><LazyLoad><SipCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/roi-calculator" element={<AppLayout><LazyLoad><RoiCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/budget-planner" element={<AppLayout><LazyLoad><BudgetPlanner /></LazyLoad></AppLayout>} />

        {/* --- IMAGE EXTRAS --- */}
        <Route path="/tools/pencil-sketch" element={<AppLayout><LazyLoad><PencilSketch /></LazyLoad></AppLayout>} />
        <Route path="/tools/passport-photo" element={<AppLayout><LazyLoad><PassportPhoto /></LazyLoad></AppLayout>} />
        <Route path="/tools/image-border" element={<AppLayout><LazyLoad><ImageBorderFrame /></LazyLoad></AppLayout>} />
        <Route path="/tools/screenshot-to-pdf" element={<AppLayout><LazyLoad><ScreenshotToPdf /></LazyLoad></AppLayout>} />
        <Route path="/tools/heic-to-jpg" element={<AppLayout><LazyLoad><HeicToJpg /></LazyLoad></AppLayout>} />
        <Route path="/tools/svg-to-png" element={<AppLayout><LazyLoad><SvgToPng /></LazyLoad></AppLayout>} />

        {/* --- UNIT CONVERTERS --- */}
        <Route path="/tools/data-storage-converter" element={<AppLayout><LazyLoad><DataStorageConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/cooking-converter" element={<AppLayout><LazyLoad><CookingConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/shoe-size-converter" element={<AppLayout><LazyLoad><ShoeSizeConverter /></LazyLoad></AppLayout>} />
        <Route path="/tools/clothing-size-converter" element={<AppLayout><LazyLoad><ClothingSizeConverter /></LazyLoad></AppLayout>} />

        {/* --- WRITING --- */}
        <Route path="/tools/cover-letter" element={<AppLayout><LazyLoad><CoverLetterTemplate /></LazyLoad></AppLayout>} />
        <Route path="/tools/haiku-generator" element={<AppLayout><LazyLoad><HaikuGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/duplicate-sentences" element={<AppLayout><LazyLoad><DuplicateSentenceFinder /></LazyLoad></AppLayout>} />

        {/* --- EDUCATION --- */}
        <Route path="/tools/citation-generator" element={<AppLayout><LazyLoad><CitationGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/flashcard-maker" element={<AppLayout><LazyLoad><FlashcardMaker /></LazyLoad></AppLayout>} />
        <Route path="/tools/quiz-maker" element={<AppLayout><LazyLoad><QuizMaker /></LazyLoad></AppLayout>} />
        <Route path="/tools/exam-countdown" element={<AppLayout><LazyLoad><ExamCountdown /></LazyLoad></AppLayout>} />
        <Route path="/tools/essay-outline" element={<AppLayout><LazyLoad><EssayOutline /></LazyLoad></AppLayout>} />
        <Route path="/tools/periodic-table" element={<AppLayout><LazyLoad><PeriodicTable /></LazyLoad></AppLayout>} />
        <Route path="/tools/multiplication-table" element={<AppLayout><LazyLoad><MultiplicationTable /></LazyLoad></AppLayout>} />
        <Route path="/tools/study-timetable" element={<AppLayout><LazyLoad><StudyTimetable /></LazyLoad></AppLayout>} />
        <Route path="/tools/venn-diagram" element={<AppLayout><LazyLoad><VennDiagram /></LazyLoad></AppLayout>} />
        <Route path="/tools/plagiarism-checker" element={<AppLayout><LazyLoad><PlagiarismChecker /></LazyLoad></AppLayout>} />

        {/* --- HOUSEHOLD --- */}
        <Route path="/tools/shopping-list" element={<AppLayout><LazyLoad><ShoppingList /></LazyLoad></AppLayout>} />
        <Route path="/tools/bill-splitter" element={<AppLayout><LazyLoad><BillSplitter /></LazyLoad></AppLayout>} />
        <Route path="/tools/rent-vs-buy" element={<AppLayout><LazyLoad><RentVsBuy /></LazyLoad></AppLayout>} />
        <Route path="/tools/moving-checklist" element={<AppLayout><LazyLoad><MovingChecklist /></LazyLoad></AppLayout>} />
        <Route path="/tools/packing-list" element={<AppLayout><LazyLoad><PackingList /></LazyLoad></AppLayout>} />
        <Route path="/tools/utility-cost-estimator" element={<AppLayout><LazyLoad><UtilityCostEstimator /></LazyLoad></AppLayout>} />
        <Route path="/tools/pet-age-calculator" element={<AppLayout><LazyLoad><PetAgeCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/baby-name-generator" element={<AppLayout><LazyLoad><BabyNameGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/chore-chart" element={<AppLayout><LazyLoad><ChoreChart /></LazyLoad></AppLayout>} />

        {/* --- TRAVEL --- */}
        <Route path="/tools/flight-duration" element={<AppLayout><LazyLoad><FlightDuration /></LazyLoad></AppLayout>} />
        <Route path="/tools/visa-checker" element={<AppLayout><LazyLoad><VisaChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/plug-type-checker" element={<AppLayout><LazyLoad><PlugTypeChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/holiday-checker" element={<AppLayout><LazyLoad><HolidayChecker /></LazyLoad></AppLayout>} />
        <Route path="/tools/city-distance" element={<AppLayout><LazyLoad><CityDistance /></LazyLoad></AppLayout>} />
        <Route path="/tools/meeting-planner" element={<AppLayout><LazyLoad><MeetingPlanner /></LazyLoad></AppLayout>} />

        {/* --- BUSINESS --- */}
        <Route path="/tools/freelance-rate" element={<AppLayout><LazyLoad><FreelanceRate /></LazyLoad></AppLayout>} />
        <Route path="/tools/proposal-generator" element={<AppLayout><LazyLoad><ProposalGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/time-tracker" element={<AppLayout><LazyLoad><TimeTracker /></LazyLoad></AppLayout>} />
        <Route path="/tools/work-hours" element={<AppLayout><LazyLoad><WorkHours /></LazyLoad></AppLayout>} />
        <Route path="/tools/break-even" element={<AppLayout><LazyLoad><BreakEven /></LazyLoad></AppLayout>} />
        <Route path="/tools/business-name-generator" element={<AppLayout><LazyLoad><BusinessNameGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/slogan-generator" element={<AppLayout><LazyLoad><SloganGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/email-subject-tester" element={<AppLayout><LazyLoad><EmailSubjectTester /></LazyLoad></AppLayout>} />
        <Route path="/tools/contract-template" element={<AppLayout><LazyLoad><ContractTemplate /></LazyLoad></AppLayout>} />

        {/* --- SCIENCE --- */}
        <Route path="/tools/ohms-law" element={<AppLayout><LazyLoad><OhmsLaw /></LazyLoad></AppLayout>} />
        <Route path="/tools/resistor-calculator" element={<AppLayout><LazyLoad><ResistorCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/truth-table" element={<AppLayout><LazyLoad><TruthTable /></LazyLoad></AppLayout>} />
        <Route path="/tools/sig-figs" element={<AppLayout><LazyLoad><SigFigs /></LazyLoad></AppLayout>} />
        <Route path="/tools/scientific-notation" element={<AppLayout><LazyLoad><ScientificNotation /></LazyLoad></AppLayout>} />
        <Route path="/tools/half-life" element={<AppLayout><LazyLoad><HalfLife /></LazyLoad></AppLayout>} />
        <Route path="/tools/ph-calculator" element={<AppLayout><LazyLoad><PhCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/molar-mass" element={<AppLayout><LazyLoad><MolarMass /></LazyLoad></AppLayout>} />
        <Route path="/tools/projectile-motion" element={<AppLayout><LazyLoad><ProjectileMotion /></LazyLoad></AppLayout>} />
        <Route path="/tools/roman-numeral" element={<AppLayout><LazyLoad><RomanNumeral /></LazyLoad></AppLayout>} />

        {/* --- DATA & SPREADSHEET --- */}
        <Route path="/tools/spreadsheet-editor" element={<AppLayout><LazyLoad><SpreadsheetEditor /></LazyLoad></AppLayout>} />
        <Route path="/tools/chart-generator" element={<AppLayout><LazyLoad><ChartGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/sql-formatter" element={<AppLayout><LazyLoad><SqlFormatter /></LazyLoad></AppLayout>} />

        {/* --- PROFESSIONAL DOCS --- */}
        <Route path="/tools/reference-letter" element={<AppLayout><LazyLoad><ReferenceLetter /></LazyLoad></AppLayout>} />
        <Route path="/tools/meeting-minutes" element={<AppLayout><LazyLoad><MeetingMinutes /></LazyLoad></AppLayout>} />
        <Route path="/tools/rent-receipt" element={<AppLayout><LazyLoad><RentReceipt /></LazyLoad></AppLayout>} />
        <Route path="/tools/salary-slip" element={<AppLayout><LazyLoad><SalarySlip /></LazyLoad></AppLayout>} />
        <Route path="/tools/attendance-sheet" element={<AppLayout><LazyLoad><AttendanceSheet /></LazyLoad></AppLayout>} />

        {/* --- GEOGRAPHY --- */}
        <Route path="/tools/lat-long-finder" element={<AppLayout><LazyLoad><LatLongFinder /></LazyLoad></AppLayout>} />
        <Route path="/tools/gps-distance" element={<AppLayout><LazyLoad><GpsDistance /></LazyLoad></AppLayout>} />
        <Route path="/tools/world-clock" element={<AppLayout><LazyLoad><WorldClock /></LazyLoad></AppLayout>} />
        <Route path="/tools/sunrise-sunset" element={<AppLayout><LazyLoad><SunriseSunset /></LazyLoad></AppLayout>} />
        <Route path="/tools/moon-phase" element={<AppLayout><LazyLoad><MoonPhase /></LazyLoad></AppLayout>} />

        {/* --- FUN & VIRAL --- */}
        <Route path="/tools/chinese-zodiac" element={<AppLayout><LazyLoad><ChineseZodiac /></LazyLoad></AppLayout>} />
        <Route path="/tools/numerology-calculator" element={<AppLayout><LazyLoad><NumerologyCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/love-compatibility" element={<AppLayout><LazyLoad><LoveCompatibility /></LazyLoad></AppLayout>} />
        <Route path="/tools/life-path-number" element={<AppLayout><LazyLoad><LifePathNumber /></LazyLoad></AppLayout>} />
        <Route path="/tools/age-in-days" element={<AppLayout><LazyLoad><AgeInDays /></LazyLoad></AppLayout>} />
        <Route path="/tools/reading-speed-test" element={<AppLayout><LazyLoad><ReadingSpeedTest /></LazyLoad></AppLayout>} />

        {/* --- PLANNING --- */}
        <Route path="/tools/habit-tracker" element={<AppLayout><LazyLoad><HabitTracker /></LazyLoad></AppLayout>} />
        <Route path="/tools/daily-journal" element={<AppLayout><LazyLoad><DailyJournal /></LazyLoad></AppLayout>} />
        <Route path="/tools/weekly-planner" element={<AppLayout><LazyLoad><WeeklyPlanner /></LazyLoad></AppLayout>} />
        <Route path="/tools/meal-planner" element={<AppLayout><LazyLoad><MealPlanner /></LazyLoad></AppLayout>} />

        {/* --- HEALTH EXTRAS --- */}
        <Route path="/tools/sleep-calculator" element={<AppLayout><LazyLoad><SleepCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/caffeine-calculator" element={<AppLayout><LazyLoad><CaffeineCalculator /></LazyLoad></AppLayout>} />
        <Route path="/tools/retirement-calculator" element={<AppLayout><LazyLoad><RetirementCalculator /></LazyLoad></AppLayout>} />

        {/* --- WELLNESS --- */}
        <Route path="/tools/ambient-sound-mixer" element={<AppLayout><LazyLoad><AmbientSoundMixer /></LazyLoad></AppLayout>} />
        <Route path="/tools/breathing-exercise" element={<AppLayout><LazyLoad><BreathingExercise /></LazyLoad></AppLayout>} />
        <Route path="/tools/eye-rest-timer" element={<AppLayout><LazyLoad><EyeRestTimer /></LazyLoad></AppLayout>} />
        <Route path="/tools/affirmation-generator" element={<AppLayout><LazyLoad><AffirmationGenerator /></LazyLoad></AppLayout>} />

        {/* --- NEW DEVELOPER --- */}
        <Route path="/tools/curl-generator" element={<AppLayout><LazyLoad><CurlGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/http-status-codes" element={<AppLayout><LazyLoad><HttpStatusCodes /></LazyLoad></AppLayout>} />
        <Route path="/tools/cron-builder" element={<AppLayout><LazyLoad><CronBuilder /></LazyLoad></AppLayout>} />
        <Route path="/tools/css-box-shadow" element={<AppLayout><LazyLoad><CssBoxShadow /></LazyLoad></AppLayout>} />
        <Route path="/tools/css-border-radius" element={<AppLayout><LazyLoad><CssBorderRadius /></LazyLoad></AppLayout>} />
        <Route path="/tools/flexbox-playground" element={<AppLayout><LazyLoad><FlexboxPlayground /></LazyLoad></AppLayout>} />
        <Route path="/tools/robots-txt-generator" element={<AppLayout><LazyLoad><RobotsTxtGenerator /></LazyLoad></AppLayout>} />
        <Route path="/tools/image-to-pdf" element={<AppLayout><LazyLoad><ImageToPdf /></LazyLoad></AppLayout>} />
        </Routes>
      </PageTransition>
      <Toaster />
    </TransitionProvider>
  );
}
