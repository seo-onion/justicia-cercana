import {
  Wifi, WifiOff, CloudUpload, CircleCheckBig, Clock, Tablet, TriangleAlert, Check, CircleHelp,
  House, FileText, Stamp, Calendar, Gavel, Users, MapPin, CircleX, Search, Plus, ArrowLeft,
  ArrowRight, Undo2, Camera, Pencil, Save, Send, RotateCw, Lock, BatteryLow, ChevronLeft,
  ChevronRight, X, Type, Smartphone, Trash2, Eye, ListFilter, Info, CalendarClock, Link2,
  Monitor, Paperclip, SkipForward, Scale, LockKeyhole, RotateCcw
} from 'lucide-react'

const MAPA = {
  Wifi, WifiOff, CloudUpload, CircleCheckBig, Clock, Tablet, TriangleAlert, Check, CircleHelp,
  House, FileText, Stamp, Calendar, Gavel, Users, MapPin, CircleX, Search, Plus, ArrowLeft,
  ArrowRight, Undo2, Camera, Pencil, Save, Send, RotateCw, Lock, BatteryLow, ChevronLeft,
  ChevronRight, X, Type, Smartphone, Trash2, Eye, ListFilter, Info, CalendarClock, Link2,
  Monitor, Paperclip, SkipForward, Scale, LockKeyhole, RotateCcw
}

export default function Icono({ n, t = 20, ...resto }) {
  const C = MAPA[n] || Info
  return <C size={t} strokeWidth={2} aria-hidden="true" {...resto} />
}
