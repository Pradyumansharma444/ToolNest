import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
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

function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children || <Outlet />}</main>
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
    <>
      <PageTransition>
        <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tools" element={<AllToolsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* PDF Tools */}
        <Route path="/tools/merge-pdf" element={<MergePdf />} />
        <Route path="/tools/split-pdf" element={<SplitPdf />} />
        <Route path="/tools/compress-pdf" element={<CompressPdf />} />
        <Route path="/tools/pdf-to-word" element={<PdfToWord />} />
        <Route path="/tools/ocr-pdf" element={<OcrPdf />} />
        <Route path="/tools/esign-pdf" element={<EsignPdf />} />
        <Route path="/tools/unlock-pdf" element={<UnlockPdf />} />
        <Route path="/tools/rotate-pdf" element={<RotatePdf />} />
        <Route path="/tools/watermark-pdf" element={<WatermarkPdf />} />
        <Route path="/tools/pdf-to-jpg" element={<LazyLoad><PdfToJpg /></LazyLoad>} />
        <Route path="/tools/word-to-pdf" element={<LazyLoad><WordToPdf /></LazyLoad>} />
        <Route path="/tools/powerpoint-to-pdf" element={<LazyLoad><PowerpointToPdf /></LazyLoad>} />
        <Route path="/tools/pdf-to-powerpoint" element={<LazyLoad><PdfToPowerpoint /></LazyLoad>} />
        <Route path="/tools/jpg-to-pdf" element={<LazyLoad><JpgToPdf /></LazyLoad>} />
        <Route path="/tools/html-to-pdf" element={<LazyLoad><HtmlToPdf /></LazyLoad>} />
        <Route path="/tools/edit-pdf" element={<LazyLoad><EditPdf /></LazyLoad>} />
        <Route path="/tools/protect-pdf" element={<LazyLoad><ProtectPdf /></LazyLoad>} />
        <Route path="/tools/organize-pdf" element={<LazyLoad><OrganizePdf /></LazyLoad>} />
        <Route path="/tools/page-numbers" element={<LazyLoad><PageNumbers /></LazyLoad>} />
        <Route path="/tools/crop-pdf" element={<LazyLoad><CropPdf /></LazyLoad>} />
        <Route path="/tools/compare-pdf" element={<LazyLoad><ComparePdf /></LazyLoad>} />
        <Route path="/tools/redact-pdf" element={<LazyLoad><RedactPdf /></LazyLoad>} />
        <Route path="/tools/repair-pdf" element={<LazyLoad><RepairPdf /></LazyLoad>} />
        <Route path="/tools/pdf-to-pdfa" element={<LazyLoad><PdfToPdfA /></LazyLoad>} />
        <Route path="/tools/pdf-forms" element={<LazyLoad><PdfForms /></LazyLoad>} />
        <Route path="/tools/ai-summarizer" element={<LazyLoad><AiSummarizer /></LazyLoad>} />
        <Route path="/tools/translate-pdf" element={<LazyLoad><TranslatePdf /></LazyLoad>} />
        <Route path="/tools/scan-to-pdf" element={<LazyLoad><ScanToPdf /></LazyLoad>} />

        {/* Image Tools */}
        <Route path="/tools/compress-image" element={<CompressImage />} />
        <Route path="/tools/resize-image" element={<ResizeImage />} />
        <Route path="/tools/crop-image" element={<CropImage />} />
        <Route path="/tools/remove-background" element={<RemoveBg />} />
        <Route path="/tools/upscale-image" element={<UpscaleImage />} />
        <Route path="/tools/convert-image" element={<ConvertImage />} />
        <Route path="/tools/color-correct" element={<ColorCorrect />} />
        <Route path="/tools/watermark-image" element={<WatermarkImage />} />

        {/* Text Tools */}
        <Route path="/tools/spell-check" element={<SpellCheck />} />
        <Route path="/tools/paraphrase" element={<Paraphrase />} />
        <Route path="/tools/word-counter" element={<WordCounter />} />
        <Route path="/tools/diff-checker" element={<DiffChecker />} />
        <Route path="/tools/case-converter" element={<CaseConverter />} />
        <Route path="/tools/text-to-speech" element={<TextToSpeech />} />

        {/* Spreadsheet Tools */}
        <Route path="/tools/csv-to-json" element={<CsvToJson />} />
        <Route path="/tools/json-to-csv" element={<JsonToCsv />} />
        <Route path="/tools/csv-to-xml" element={<CsvToXml />} />
        <Route path="/tools/csv-to-sql" element={<CsvToSql />} />
        <Route path="/tools/merge-csv" element={<MergeCsv />} />
        <Route path="/tools/split-csv" element={<SplitCsv />} />
        <Route path="/tools/fake-data" element={<FakeData />} />

        {/* Calculator Tools */}
        <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
        <Route path="/tools/timezone-converter" element={<TimezoneConverter />} />
        <Route path="/tools/unit-converter" element={<UnitConverter />} />
        <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
        <Route path="/tools/tip-calculator" element={<TipCalculator />} />
        <Route path="/tools/bmi-calculator" element={<BmiCalculator />} />
        <Route path="/tools/loan-calculator" element={<LoanCalculator />} />

        {/* Resize Tools */}
        <Route path="/tools/resize-by-dimensions" element={<ResizeByDimensions />} />
        <Route path="/tools/social-media-resize" element={<SocialMediaResize />} />

        {/* Enhancer Tools */}
        <Route path="/tools/ai-upscale" element={<AiUpscale />} />
        <Route path="/tools/enhancer-remove-bg" element={<RemoveBgPro />} />
        <Route path="/tools/sharpen" element={<Sharpen />} />
        <Route path="/tools/art-filters" element={<ArtFilters />} />

        {/* Developer & Code Tools */}
        <Route path="/tools/json-formatter" element={<LazyLoad><JsonFormatter /></LazyLoad>} />
        <Route path="/tools/xml-formatter" element={<LazyLoad><XmlFormatter /></LazyLoad>} />
        <Route path="/tools/base64-encoder" element={<LazyLoad><Base64Encoder /></LazyLoad>} />
        <Route path="/tools/url-encoder" element={<LazyLoad><UrlEncoder /></LazyLoad>} />
        <Route path="/tools/html-encoder" element={<LazyLoad><HtmlEncoder /></LazyLoad>} />
        <Route path="/tools/qr-code-generator" element={<LazyLoad><QrCodeGenerator /></LazyLoad>} />
        <Route path="/tools/uuid-generator" element={<LazyLoad><UuidGenerator /></LazyLoad>} />
        <Route path="/tools/jwt-decoder" element={<LazyLoad><JwtDecoder /></LazyLoad>} />
        <Route path="/tools/hash-generator" element={<LazyLoad><HashGenerator /></LazyLoad>} />
        <Route path="/tools/regex-tester" element={<LazyLoad><RegexTester /></LazyLoad>} />
        <Route path="/tools/code-minifier" element={<LazyLoad><CodeMinifier /></LazyLoad>} />
        <Route path="/tools/markdown-converter" element={<LazyLoad><MarkdownConverter /></LazyLoad>} />
        <Route path="/tools/unix-timestamp" element={<LazyLoad><UnixTimestamp /></LazyLoad>} />
        <Route path="/tools/json-to-yaml" element={<LazyLoad><JsonToYaml /></LazyLoad>} />
        <Route path="/tools/css-beautifier" element={<LazyLoad><CssBeautifier /></LazyLoad>} />

        {/* Video Tools */}
        <Route path="/tools/video-compressor" element={<LazyLoad><VideoCompressor /></LazyLoad>} />
        <Route path="/tools/video-trimmer" element={<LazyLoad><VideoTrimmer /></LazyLoad>} />
        <Route path="/tools/video-to-gif" element={<LazyLoad><VideoToGif /></LazyLoad>} />
        <Route path="/tools/video-to-audio" element={<LazyLoad><VideoToAudio /></LazyLoad>} />
        <Route path="/tools/video-converter" element={<LazyLoad><VideoConverter /></LazyLoad>} />
        <Route path="/tools/video-merger" element={<LazyLoad><VideoMerger /></LazyLoad>} />
        <Route path="/tools/video-subtitles" element={<LazyLoad><VideoSubtitles /></LazyLoad>} />
        <Route path="/tools/reverse-video" element={<LazyLoad><ReverseVideo /></LazyLoad>} />

        {/* Audio Tools */}
        <Route path="/tools/audio-trimmer" element={<LazyLoad><AudioTrimmer /></LazyLoad>} />
        <Route path="/tools/audio-converter" element={<LazyLoad><AudioConverter /></LazyLoad>} />
        <Route path="/tools/audio-compressor" element={<LazyLoad><AudioCompressor /></LazyLoad>} />
        <Route path="/tools/audio-merger" element={<LazyLoad><AudioMerger /></LazyLoad>} />
        <Route path="/tools/voice-recorder" element={<LazyLoad><VoiceRecorder /></LazyLoad>} />
        <Route path="/tools/audio-volume" element={<LazyLoad><AudioVolume /></LazyLoad>} />

        {/* Color Tools */}
        <Route path="/tools/color-picker" element={<LazyLoad><ColorPicker /></LazyLoad>} />
        <Route path="/tools/palette-generator" element={<LazyLoad><PaletteGenerator /></LazyLoad>} />
        <Route path="/tools/gradient-generator" element={<LazyLoad><GradientGenerator /></LazyLoad>} />
        <Route path="/tools/contrast-checker" element={<LazyLoad><ContrastChecker /></LazyLoad>} />
        <Route path="/tools/color-converter" element={<LazyLoad><ColorConverter /></LazyLoad>} />

        {/* Date & Time Tools */}
        <Route path="/tools/age-calculator" element={<LazyLoad><AgeCalculator /></LazyLoad>} />
        <Route path="/tools/date-difference" element={<LazyLoad><DateDifference /></LazyLoad>} />
        <Route path="/tools/day-finder" element={<LazyLoad><DayFinder /></LazyLoad>} />
        <Route path="/tools/add-subtract-days" element={<LazyLoad><AddSubtractDays /></LazyLoad>} />
        <Route path="/tools/stopwatch-countdown" element={<LazyLoad><StopwatchCountdown /></LazyLoad>} />

        {/* Security Tools */}
        <Route path="/tools/password-generator" element={<LazyLoad><PasswordGenerator /></LazyLoad>} />
        <Route path="/tools/password-strength" element={<LazyLoad><PasswordStrength /></LazyLoad>} />
        <Route path="/tools/random-dice" element={<LazyLoad><RandomDice /></LazyLoad>} />
        <Route path="/tools/pick-random" element={<LazyLoad><PickRandom /></LazyLoad>} />
        <Route path="/tools/bcrypt-generator" element={<LazyLoad><BcryptGenerator /></LazyLoad>} />
        <Route path="/tools/hmac-generator" element={<LazyLoad><HmacGenerator /></LazyLoad>} />
        <Route path="/tools/checksum-file" element={<LazyLoad><ChecksumFile /></LazyLoad>} />

        {/* Extended Text Tools */}
        <Route path="/tools/lorem-ipsum" element={<LazyLoad><LoremIpsum /></LazyLoad>} />
        <Route path="/tools/duplicate-remover" element={<LazyLoad><DuplicateRemover /></LazyLoad>} />
        <Route path="/tools/line-shuffler" element={<LazyLoad><LineShuffler /></LazyLoad>} />
        <Route path="/tools/text-to-slug" element={<LazyLoad><TextToSlug /></LazyLoad>} />
        <Route path="/tools/reverse-text" element={<LazyLoad><ReverseText /></LazyLoad>} />
        <Route path="/tools/char-counter" element={<LazyLoad><CharCounter /></LazyLoad>} />
        <Route path="/tools/text-repeater" element={<LazyLoad><TextRepeater /></LazyLoad>} />
        <Route path="/tools/list-sorter" element={<LazyLoad><ListSorter /></LazyLoad>} />
        <Route path="/tools/speech-to-text" element={<LazyLoad><SpeechToText /></LazyLoad>} />
        <Route path="/tools/find-replace" element={<LazyLoad><FindReplace /></LazyLoad>} />

        {/* Document & Ebook Tools */}
        <Route path="/tools/epub-to-pdf" element={<LazyLoad><EpubToPdf /></LazyLoad>} />
        <Route path="/tools/pdf-to-epub" element={<LazyLoad><PdfToEpub /></LazyLoad>} />
        <Route path="/tools/resize-epub" element={<LazyLoad><ResizeEpub /></LazyLoad>} />
        <Route path="/tools/rtf-to-pdf" element={<LazyLoad><RtfToPdf /></LazyLoad>} />

        {/* Archive Tools */}
        <Route path="/tools/create-zip" element={<LazyLoad><CreateZip /></LazyLoad>} />
        <Route path="/tools/extract-archive" element={<LazyLoad><ExtractArchive /></LazyLoad>} />
        <Route path="/tools/compress-folder" element={<LazyLoad><CompressFolder /></LazyLoad>} />
        <Route path="/tools/unzip-specific" element={<LazyLoad><UnzipSpecific /></LazyLoad>} />

        {/* Network Tools */}
        <Route path="/tools/whats-my-ip" element={<LazyLoad><WhatsMyIp /></LazyLoad>} />
        <Route path="/tools/user-agent-parser" element={<LazyLoad><UserAgentParser /></LazyLoad>} />
        <Route path="/tools/internet-speed-test" element={<LazyLoad><InternetSpeedTest /></LazyLoad>} />
        <Route path="/tools/url-parser" element={<LazyLoad><UrlParser /></LazyLoad>} />

        {/* Social Tools */}
        <Route path="/tools/meta-tags-preview" element={<LazyLoad><MetaTagsPreview /></LazyLoad>} />
        <Route path="/tools/youtube-thumbnail" element={<LazyLoad><YoutubeThumbnail /></LazyLoad>} />
        <Route path="/tools/hashtag-generator" element={<LazyLoad><HashtagGenerator /></LazyLoad>} />
        <Route path="/tools/email-signature" element={<LazyLoad><EmailSignature /></LazyLoad>} />
        <Route path="/tools/qr-code-scanner" element={<LazyLoad><QrCodeScanner /></LazyLoad>} />
        <Route path="/tools/barcode-generator" element={<LazyLoad><BarcodeGenerator /></LazyLoad>} />

        {/* Design Tools */}
        <Route path="/tools/meme-generator" element={<LazyLoad><MemeGenerator /></LazyLoad>} />
        <Route path="/tools/image-collage" element={<LazyLoad><ImageCollage /></LazyLoad>} />
        <Route path="/tools/image-splitter" element={<LazyLoad><ImageSplitter /></LazyLoad>} />
        <Route path="/tools/favicon-generator" element={<LazyLoad><FaviconGenerator /></LazyLoad>} />
        <Route path="/tools/whiteboard" element={<LazyLoad><Whiteboard /></LazyLoad>} />
        <Route path="/tools/palette-from-image" element={<LazyLoad><PaletteFromImage /></LazyLoad>} />

        {/* Productivity Tools */}
        <Route path="/tools/ocr-image" element={<LazyLoad><OcrImage /></LazyLoad>} />
        <Route path="/tools/handwriting-generator" element={<LazyLoad><HandwritingGenerator /></LazyLoad>} />
        <Route path="/tools/pdf-to-excel" element={<LazyLoad><PdfToExcel /></LazyLoad>} />
        <Route path="/tools/excel-to-pdf" element={<LazyLoad><ExcelToPdf /></LazyLoad>} />
        <Route path="/tools/merge-word" element={<LazyLoad><MergeWord /></LazyLoad>} />
        <Route path="/tools/split-word" element={<LazyLoad><SplitWord /></LazyLoad>} />

        {/* Fun Tools */}
        <Route path="/tools/word-cloud" element={<LazyLoad><WordCloud /></LazyLoad>} />
        <Route path="/tools/readability-score" element={<LazyLoad><ReadabilityScore /></LazyLoad>} />
        <Route path="/tools/char-frequency" element={<LazyLoad><CharFrequency /></LazyLoad>} />
        <Route path="/tools/spin-wheel" element={<LazyLoad><SpinWheel /></LazyLoad>} />
        <Route path="/tools/random-name-picker" element={<LazyLoad><RandomNamePicker /></LazyLoad>} />

        {/* Extra Audio/Video Tools */}
        <Route path="/tools/screen-recorder" element={<LazyLoad><ScreenRecorder /></LazyLoad>} />
        <Route path="/tools/webcam-recorder" element={<LazyLoad><WebcamRecorder /></LazyLoad>} />
        <Route path="/tools/karaoke-recorder" element={<LazyLoad><KaraokeRecorder /></LazyLoad>} />

        {/* Fun Tools */}
        <Route path="/tools/pomodoro-timer" element={<LazyLoad><PomodoroTimer /></LazyLoad>} />

        {/* Network Tools - continued */}
        <Route path="/tools/http-header-viewer" element={<LazyLoad><HttpHeaderViewer /></LazyLoad>} />

        {/* Viral Tools */}
        <Route path="/tools/resume-builder" element={<LazyLoad><ResumeBuilder /></LazyLoad>} />
        <Route path="/tools/invoice-generator" element={<LazyLoad><InvoiceGenerator /></LazyLoad>} />
        <Route path="/tools/calendar-generator" element={<LazyLoad><CalendarGenerator /></LazyLoad>} />
        <Route path="/tools/qr-business-card" element={<LazyLoad><QrBusinessCard /></LazyLoad>} />
        <Route path="/tools/subtitle-generator" element={<LazyLoad><SubtitleGenerator /></LazyLoad>} />

        {/* --- GAMES --- */}
        <Route path="/games/wordle" element={<LazyLoad><WordleGame /></LazyLoad>} />
        <Route path="/games/2048" element={<LazyLoad><Game2048 /></LazyLoad>} />
        <Route path="/games/sudoku" element={<LazyLoad><SudokuGame /></LazyLoad>} />
        <Route path="/games/minesweeper" element={<LazyLoad><MinesweeperGame /></LazyLoad>} />
        <Route path="/games/chess" element={<LazyLoad><ChessGame /></LazyLoad>} />
        <Route path="/games/checkers" element={<LazyLoad><CheckersGame /></LazyLoad>} />
        <Route path="/games/memory" element={<LazyLoad><MemoryCardFlip /></LazyLoad>} />
        <Route path="/games/snake" element={<LazyLoad><SnakeGame /></LazyLoad>} />
        <Route path="/games/tetris" element={<LazyLoad><TetrisGame /></LazyLoad>} />
        <Route path="/games/tic-tac-toe" element={<LazyLoad><TicTacToe /></LazyLoad>} />
        <Route path="/games/15-puzzle" element={<LazyLoad><SlidingPuzzle /></LazyLoad>} />
        <Route path="/games/typing-test" element={<LazyLoad><TypingSpeedTest /></LazyLoad>} />
        <Route path="/games/math-challenge" element={<LazyLoad><MathSpeedChallenge /></LazyLoad>} />
        <Route path="/games/flag-quiz" element={<LazyLoad><FlagQuiz /></LazyLoad>} />
        <Route path="/games/reaction-time" element={<LazyLoad><ReactionTimeTester /></LazyLoad>} />
        <Route path="/games/simon-says" element={<LazyLoad><ColorMemoryGame /></LazyLoad>} />
        <Route path="/games/geography-quiz" element={<LazyLoad><GeographyQuiz /></LazyLoad>} />
        <Route path="/games/flappy-bird" element={<LazyLoad><FlappyBirdClone /></LazyLoad>} />
        <Route path="/games/dino-run" element={<LazyLoad><DinoRunGame /></LazyLoad>} />
        <Route path="/games/rock-paper-scissors" element={<LazyLoad><RockPaperScissors /></LazyLoad>} />
        <Route path="/games/cookie-clicker" element={<LazyLoad><CookieClicker /></LazyLoad>} />
        <Route path="/games/trivia" element={<LazyLoad><TriviaQuiz /></LazyLoad>} />
        <Route path="/games/draw-and-guess" element={<LazyLoad><DrawAndGuess /></LazyLoad>} />
        <Route path="/games/multiplayer" element={<LazyLoad><MultiplayerLobby /></LazyLoad>} />

        {/* --- LANGUAGE --- */}
        <Route path="/tools/text-translator" element={<LazyLoad><TextTranslator /></LazyLoad>} />
        <Route path="/tools/language-detector" element={<LazyLoad><LanguageDetector /></LazyLoad>} />
        <Route path="/tools/pinyin-converter" element={<LazyLoad><PinyinConverter /></LazyLoad>} />
        <Route path="/tools/furigana-generator" element={<LazyLoad><FuriganaGenerator /></LazyLoad>} />
        <Route path="/tools/morse-code" element={<LazyLoad><MorseCodeTranslator /></LazyLoad>} />
        <Route path="/tools/number-to-words" element={<LazyLoad><NumberToWords /></LazyLoad>} />
        <Route path="/tools/chinese-char-counter" element={<LazyLoad><ChineseCharCounter /></LazyLoad>} />
        <Route path="/tools/binary-hex-converter" element={<LazyLoad><BinaryHexConverter /></LazyLoad>} />
        <Route path="/tools/romaji-converter" element={<LazyLoad><RomajiConverter /></LazyLoad>} />

        {/* --- MATH --- */}
        <Route path="/tools/scientific-calculator" element={<LazyLoad><ScientificCalculator /></LazyLoad>} />
        <Route path="/tools/fraction-calculator" element={<LazyLoad><FractionCalculator /></LazyLoad>} />
        <Route path="/tools/lcm-gcd" element={<LazyLoad><LcmGcdCalculator /></LazyLoad>} />
        <Route path="/tools/prime-checker" element={<LazyLoad><PrimeChecker /></LazyLoad>} />
        <Route path="/tools/matrix-calculator" element={<LazyLoad><MatrixCalculator /></LazyLoad>} />
        <Route path="/tools/quadratic-solver" element={<LazyLoad><QuadraticSolver /></LazyLoad>} />
        <Route path="/tools/statistics-calculator" element={<LazyLoad><StatisticsCalculator /></LazyLoad>} />
        <Route path="/tools/number-base-converter" element={<LazyLoad><NumberBaseConverter /></LazyLoad>} />
        <Route path="/tools/gst-tax-calculator" element={<LazyLoad><GstTaxCalculator /></LazyLoad>} />
        <Route path="/tools/fuel-calculator" element={<LazyLoad><FuelCalculator /></LazyLoad>} />

        {/* --- HEALTH --- */}
        <Route path="/tools/calorie-calculator" element={<LazyLoad><CalorieCalculator /></LazyLoad>} />
        <Route path="/tools/body-fat-calculator" element={<LazyLoad><BodyFatCalculator /></LazyLoad>} />
        <Route path="/tools/water-intake" element={<LazyLoad><WaterIntakeCalculator /></LazyLoad>} />
        <Route path="/tools/pregnancy-calculator" element={<LazyLoad><PregnancyCalculator /></LazyLoad>} />
        <Route path="/tools/ovulation-calculator" element={<LazyLoad><OvulationCalculator /></LazyLoad>} />
        <Route path="/tools/blood-pressure" element={<LazyLoad><BloodPressureChecker /></LazyLoad>} />
        <Route path="/tools/heart-rate-zones" element={<LazyLoad><HeartRateZones /></LazyLoad>} />

        {/* --- FINANCE --- */}
        <Route path="/tools/interest-calculator" element={<LazyLoad><InterestCalculator /></LazyLoad>} />
        <Route path="/tools/sip-calculator" element={<LazyLoad><SipCalculator /></LazyLoad>} />
        <Route path="/tools/roi-calculator" element={<LazyLoad><RoiCalculator /></LazyLoad>} />
        <Route path="/tools/budget-planner" element={<LazyLoad><BudgetPlanner /></LazyLoad>} />

        {/* --- IMAGE EXTRAS --- */}
        <Route path="/tools/pencil-sketch" element={<LazyLoad><PencilSketch /></LazyLoad>} />
        <Route path="/tools/passport-photo" element={<LazyLoad><PassportPhoto /></LazyLoad>} />
        <Route path="/tools/image-border" element={<LazyLoad><ImageBorderFrame /></LazyLoad>} />
        <Route path="/tools/screenshot-to-pdf" element={<LazyLoad><ScreenshotToPdf /></LazyLoad>} />
        <Route path="/tools/heic-to-jpg" element={<LazyLoad><HeicToJpg /></LazyLoad>} />
        <Route path="/tools/svg-to-png" element={<LazyLoad><SvgToPng /></LazyLoad>} />

        {/* --- UNIT CONVERTERS --- */}
        <Route path="/tools/data-storage-converter" element={<LazyLoad><DataStorageConverter /></LazyLoad>} />
        <Route path="/tools/cooking-converter" element={<LazyLoad><CookingConverter /></LazyLoad>} />
        <Route path="/tools/shoe-size-converter" element={<LazyLoad><ShoeSizeConverter /></LazyLoad>} />
        <Route path="/tools/clothing-size-converter" element={<LazyLoad><ClothingSizeConverter /></LazyLoad>} />

        {/* --- WRITING --- */}
        <Route path="/tools/cover-letter" element={<LazyLoad><CoverLetterTemplate /></LazyLoad>} />
        <Route path="/tools/haiku-generator" element={<LazyLoad><HaikuGenerator /></LazyLoad>} />
        <Route path="/tools/duplicate-sentences" element={<LazyLoad><DuplicateSentenceFinder /></LazyLoad>} />

        {/* --- EDUCATION --- */}
        <Route path="/tools/citation-generator" element={<LazyLoad><CitationGenerator /></LazyLoad>} />
        <Route path="/tools/flashcard-maker" element={<LazyLoad><FlashcardMaker /></LazyLoad>} />
        <Route path="/tools/quiz-maker" element={<LazyLoad><QuizMaker /></LazyLoad>} />
        <Route path="/tools/exam-countdown" element={<LazyLoad><ExamCountdown /></LazyLoad>} />
        <Route path="/tools/essay-outline" element={<LazyLoad><EssayOutline /></LazyLoad>} />
        <Route path="/tools/periodic-table" element={<LazyLoad><PeriodicTable /></LazyLoad>} />
        <Route path="/tools/multiplication-table" element={<LazyLoad><MultiplicationTable /></LazyLoad>} />
        <Route path="/tools/study-timetable" element={<LazyLoad><StudyTimetable /></LazyLoad>} />
        <Route path="/tools/venn-diagram" element={<LazyLoad><VennDiagram /></LazyLoad>} />
        <Route path="/tools/plagiarism-checker" element={<LazyLoad><PlagiarismChecker /></LazyLoad>} />

        {/* --- HOUSEHOLD --- */}
        <Route path="/tools/shopping-list" element={<LazyLoad><ShoppingList /></LazyLoad>} />
        <Route path="/tools/bill-splitter" element={<LazyLoad><BillSplitter /></LazyLoad>} />
        <Route path="/tools/rent-vs-buy" element={<LazyLoad><RentVsBuy /></LazyLoad>} />
        <Route path="/tools/moving-checklist" element={<LazyLoad><MovingChecklist /></LazyLoad>} />
        <Route path="/tools/packing-list" element={<LazyLoad><PackingList /></LazyLoad>} />
        <Route path="/tools/utility-cost-estimator" element={<LazyLoad><UtilityCostEstimator /></LazyLoad>} />
        <Route path="/tools/pet-age-calculator" element={<LazyLoad><PetAgeCalculator /></LazyLoad>} />
        <Route path="/tools/baby-name-generator" element={<LazyLoad><BabyNameGenerator /></LazyLoad>} />
        <Route path="/tools/chore-chart" element={<LazyLoad><ChoreChart /></LazyLoad>} />

        {/* --- TRAVEL --- */}
        <Route path="/tools/flight-duration" element={<LazyLoad><FlightDuration /></LazyLoad>} />
        <Route path="/tools/visa-checker" element={<LazyLoad><VisaChecker /></LazyLoad>} />
        <Route path="/tools/plug-type-checker" element={<LazyLoad><PlugTypeChecker /></LazyLoad>} />
        <Route path="/tools/holiday-checker" element={<LazyLoad><HolidayChecker /></LazyLoad>} />
        <Route path="/tools/city-distance" element={<LazyLoad><CityDistance /></LazyLoad>} />
        <Route path="/tools/meeting-planner" element={<LazyLoad><MeetingPlanner /></LazyLoad>} />

        {/* --- BUSINESS --- */}
        <Route path="/tools/freelance-rate" element={<LazyLoad><FreelanceRate /></LazyLoad>} />
        <Route path="/tools/proposal-generator" element={<LazyLoad><ProposalGenerator /></LazyLoad>} />
        <Route path="/tools/time-tracker" element={<LazyLoad><TimeTracker /></LazyLoad>} />
        <Route path="/tools/work-hours" element={<LazyLoad><WorkHours /></LazyLoad>} />
        <Route path="/tools/break-even" element={<LazyLoad><BreakEven /></LazyLoad>} />
        <Route path="/tools/business-name-generator" element={<LazyLoad><BusinessNameGenerator /></LazyLoad>} />
        <Route path="/tools/slogan-generator" element={<LazyLoad><SloganGenerator /></LazyLoad>} />
        <Route path="/tools/email-subject-tester" element={<LazyLoad><EmailSubjectTester /></LazyLoad>} />
        <Route path="/tools/contract-template" element={<LazyLoad><ContractTemplate /></LazyLoad>} />

        {/* --- SCIENCE --- */}
        <Route path="/tools/ohms-law" element={<LazyLoad><OhmsLaw /></LazyLoad>} />
        <Route path="/tools/resistor-calculator" element={<LazyLoad><ResistorCalculator /></LazyLoad>} />
        <Route path="/tools/truth-table" element={<LazyLoad><TruthTable /></LazyLoad>} />
        <Route path="/tools/sig-figs" element={<LazyLoad><SigFigs /></LazyLoad>} />
        <Route path="/tools/scientific-notation" element={<LazyLoad><ScientificNotation /></LazyLoad>} />
        <Route path="/tools/half-life" element={<LazyLoad><HalfLife /></LazyLoad>} />
        <Route path="/tools/ph-calculator" element={<LazyLoad><PhCalculator /></LazyLoad>} />
        <Route path="/tools/molar-mass" element={<LazyLoad><MolarMass /></LazyLoad>} />
        <Route path="/tools/projectile-motion" element={<LazyLoad><ProjectileMotion /></LazyLoad>} />
        <Route path="/tools/roman-numeral" element={<LazyLoad><RomanNumeral /></LazyLoad>} />

        {/* --- DATA & SPREADSHEET --- */}
        <Route path="/tools/spreadsheet-editor" element={<LazyLoad><SpreadsheetEditor /></LazyLoad>} />
        <Route path="/tools/chart-generator" element={<LazyLoad><ChartGenerator /></LazyLoad>} />
        <Route path="/tools/sql-formatter" element={<LazyLoad><SqlFormatter /></LazyLoad>} />

        {/* --- PROFESSIONAL DOCS --- */}
        <Route path="/tools/reference-letter" element={<LazyLoad><ReferenceLetter /></LazyLoad>} />
        <Route path="/tools/meeting-minutes" element={<LazyLoad><MeetingMinutes /></LazyLoad>} />
        <Route path="/tools/rent-receipt" element={<LazyLoad><RentReceipt /></LazyLoad>} />
        <Route path="/tools/salary-slip" element={<LazyLoad><SalarySlip /></LazyLoad>} />
        <Route path="/tools/attendance-sheet" element={<LazyLoad><AttendanceSheet /></LazyLoad>} />

        {/* --- GEOGRAPHY --- */}
        <Route path="/tools/lat-long-finder" element={<LazyLoad><LatLongFinder /></LazyLoad>} />
        <Route path="/tools/gps-distance" element={<LazyLoad><GpsDistance /></LazyLoad>} />
        <Route path="/tools/world-clock" element={<LazyLoad><WorldClock /></LazyLoad>} />
        <Route path="/tools/sunrise-sunset" element={<LazyLoad><SunriseSunset /></LazyLoad>} />
        <Route path="/tools/moon-phase" element={<LazyLoad><MoonPhase /></LazyLoad>} />

        {/* --- FUN & VIRAL --- */}
        <Route path="/tools/chinese-zodiac" element={<LazyLoad><ChineseZodiac /></LazyLoad>} />
        <Route path="/tools/numerology-calculator" element={<LazyLoad><NumerologyCalculator /></LazyLoad>} />
        <Route path="/tools/love-compatibility" element={<LazyLoad><LoveCompatibility /></LazyLoad>} />
        <Route path="/tools/life-path-number" element={<LazyLoad><LifePathNumber /></LazyLoad>} />
        <Route path="/tools/age-in-days" element={<LazyLoad><AgeInDays /></LazyLoad>} />
        <Route path="/tools/reading-speed-test" element={<LazyLoad><ReadingSpeedTest /></LazyLoad>} />

        {/* --- PLANNING --- */}
        <Route path="/tools/habit-tracker" element={<LazyLoad><HabitTracker /></LazyLoad>} />
        <Route path="/tools/daily-journal" element={<LazyLoad><DailyJournal /></LazyLoad>} />
        <Route path="/tools/weekly-planner" element={<LazyLoad><WeeklyPlanner /></LazyLoad>} />
        <Route path="/tools/meal-planner" element={<LazyLoad><MealPlanner /></LazyLoad>} />

        {/* --- HEALTH EXTRAS --- */}
        <Route path="/tools/sleep-calculator" element={<LazyLoad><SleepCalculator /></LazyLoad>} />
        <Route path="/tools/caffeine-calculator" element={<LazyLoad><CaffeineCalculator /></LazyLoad>} />
        <Route path="/tools/retirement-calculator" element={<LazyLoad><RetirementCalculator /></LazyLoad>} />

        {/* --- WELLNESS --- */}
        <Route path="/tools/ambient-sound-mixer" element={<LazyLoad><AmbientSoundMixer /></LazyLoad>} />
        <Route path="/tools/breathing-exercise" element={<LazyLoad><BreathingExercise /></LazyLoad>} />
        <Route path="/tools/eye-rest-timer" element={<LazyLoad><EyeRestTimer /></LazyLoad>} />
        <Route path="/tools/affirmation-generator" element={<LazyLoad><AffirmationGenerator /></LazyLoad>} />

        {/* --- NEW DEVELOPER --- */}
        <Route path="/tools/curl-generator" element={<LazyLoad><CurlGenerator /></LazyLoad>} />
        <Route path="/tools/http-status-codes" element={<LazyLoad><HttpStatusCodes /></LazyLoad>} />
        <Route path="/tools/cron-builder" element={<LazyLoad><CronBuilder /></LazyLoad>} />
        <Route path="/tools/css-box-shadow" element={<LazyLoad><CssBoxShadow /></LazyLoad>} />
        <Route path="/tools/css-border-radius" element={<LazyLoad><CssBorderRadius /></LazyLoad>} />
        <Route path="/tools/flexbox-playground" element={<LazyLoad><FlexboxPlayground /></LazyLoad>} />
        <Route path="/tools/robots-txt-generator" element={<LazyLoad><RobotsTxtGenerator /></LazyLoad>} />
        <Route path="/tools/image-to-pdf" element={<LazyLoad><ImageToPdf /></LazyLoad>} />
      </Route>
      </Routes>
      </PageTransition>
      <Toaster />
    </>
  );
}
