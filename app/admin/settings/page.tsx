"use client";

import * as React from "react";
import { 
  Sparkles, 
  Loader2, 
  Save, 
  RotateCcw, 
  Eye,
  Calendar,
  Settings2,
  Palette,
  AlertCircle,
  CheckCircle2,
  Clock,
  TestTube2,
  ExternalLink,
  CalendarDays,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { FESTIVALS, detectCurrentFestival, getUpcomingFestivals, getNextFestivalOccurrence, type Festival } from "@/lib/festivals";
import type { AppSettings } from "@/lib/settings-storage";
import { getSettings, updateSettings, resetSettings, checkKVStatus } from "@/app/actions/settings";

/**
 * Admin Settings Page
 * Allows administrators to configure global festival theme settings
 */
export default function AdminSettingsPage() {
  // Current saved settings
  const [savedSettings, setSavedSettings] = React.useState<AppSettings | null>(null);
  
  // Local form state (for preview)
  const [autoDetect, setAutoDetect] = React.useState(true);
  const [manualFestival, setManualFestival] = React.useState<string | null>(null);
  const [intensity, setIntensity] = React.useState<number[]>([2]);
  const [cherryBlossoms, setCherryBlossoms] = React.useState(true);
  const [festivalDecor, setFestivalDecor] = React.useState(true);
  
  // Preview state
  const [previewMode, setPreviewMode] = React.useState(false);
  const [previewFestival, setPreviewFestival] = React.useState<Festival | null>(null);
  
  // Test mode state
  const [testMode, setTestMode] = React.useState(false);
  const [simulatedDate, setSimulatedDate] = React.useState<Date | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "success" | "error">("idle");
  
  // KV configuration status
  const [kvConfigured, setKvConfigured] = React.useState<boolean | null>(null);
  
  // Reset confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);

  // Load settings on mount
  React.useEffect(() => {
    loadSettings();
    checkKvConfiguration();
  }, []);

  async function loadSettings() {
    try {
      setIsLoading(true);
      const settings = await getSettings();
      setSavedSettings(settings);
      
      // Update form state
      setAutoDetect(settings.autoDetectFestival);
      setManualFestival(settings.manualFestivalId);
      setIntensity([settings.decorationIntensity]);
      setCherryBlossoms(settings.enableCherryBlossoms);
      setFestivalDecor(settings.enableFestivalDecor);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function checkKvConfiguration() {
    try {
      const isConfigured = await checkKVStatus();
      setKvConfigured(isConfigured);
    } catch (error) {
      console.error("Failed to check KV status:", error);
      setKvConfigured(false);
    }
  }

  // Get current date (real or simulated)
  const currentDate = React.useMemo(() => {
    return simulatedDate ?? new Date();
  }, [simulatedDate]);
  
  // Get active festival for preview
  const activeFestival = React.useMemo(() => {
    if (previewMode && previewFestival) {
      return previewFestival;
    }
    
    if (autoDetect) {
      return detectCurrentFestival(currentDate);
    }
    
    if (manualFestival) {
      return FESTIVALS.find((f) => f.id === manualFestival) ?? null;
    }
    
    return null;
  }, [autoDetect, manualFestival, previewMode, previewFestival, currentDate]);
  
  // Get next upcoming festival
  const nextFestivalData = React.useMemo(() => {
    // Try to find a different festival than the currently active one
    for (const festival of FESTIVALS) {
      if (festival.id === activeFestival?.id) continue;
      
      const occurrence = getNextFestivalOccurrence(festival.id, currentDate);
      if (occurrence) {
        return occurrence;
      }
    }
    
    // If no different festival found, try the currently active one's next occurrence
    if (activeFestival) {
      const occurrence = getNextFestivalOccurrence(activeFestival.id, currentDate);
      if (occurrence) {
        return occurrence;
      }
    }
    
    return null;
  }, [currentDate, activeFestival]);

  // Handle test mode toggle
  function handleTestModeToggle() {
    if (testMode) {
      // Exit test mode
      setTestMode(false);
      setSimulatedDate(null);
      exitPreview();
    } else {
      // Enter test mode
      setTestMode(true);
      setPreviewMode(true);
      
      // Preview current settings
      if (autoDetect) {
        setPreviewFestival(detectCurrentFestival(currentDate));
      } else if (manualFestival) {
        setPreviewFestival(FESTIVALS.find((f) => f.id === manualFestival) ?? null);
      }
    }
  }
  
  // Handle quick festival preview
  function handleQuickPreview(festivalId: string) {
    const festival = FESTIVALS.find((f) => f.id === festivalId);
    if (festival) {
      setPreviewMode(true);
      setPreviewFestival(festival);
      applyFestivalTheme(festival);
    }
  }
  
  // Handle preview
  function handlePreview() {
    setPreviewMode(true);
    
    // Determine what to preview
    if (autoDetect) {
      setPreviewFestival(detectCurrentFestival(currentDate));
    } else if (manualFestival) {
      setPreviewFestival(FESTIVALS.find((f) => f.id === manualFestival) ?? null);
    }
    
    // Apply preview CSS
    if (activeFestival) {
      applyFestivalTheme(activeFestival);
    }
  }

  // Exit preview
  function exitPreview() {
    setPreviewMode(false);
    setPreviewFestival(null);
    
    // If not in test mode, also clear simulated date
    if (!testMode) {
      setSimulatedDate(null);
    }
    
    // Revert to saved settings
    if (savedSettings) {
      const savedFestival = savedSettings.autoDetectFestival
        ? detectCurrentFestival(testMode && simulatedDate ? simulatedDate : new Date())
        : savedSettings.manualFestivalId
        ? FESTIVALS.find((f) => f.id === savedSettings.manualFestivalId) ?? null
        : null;
      
      if (savedFestival) {
        applyFestivalTheme(savedFestival);
      } else {
        removeFestivalTheme();
      }
    }
  }

  // Apply festival theme to DOM
  function applyFestivalTheme(festival: Festival) {
    const root = document.documentElement;
    root.style.setProperty("--festival-primary", festival.colors.primary);
    root.style.setProperty("--festival-secondary", festival.colors.secondary);
    root.style.setProperty("--festival-accent", festival.colors.accent);
    
    if (festival.colors.background) {
      root.style.setProperty("--festival-background", festival.colors.background);
    }
    
    root.setAttribute("data-festival", festival.id);
  }

  // Remove festival theme from DOM
  function removeFestivalTheme() {
    const root = document.documentElement;
    root.style.removeProperty("--festival-primary");
    root.style.removeProperty("--festival-secondary");
    root.style.removeProperty("--festival-accent");
    root.style.removeProperty("--festival-background");
    root.removeAttribute("data-festival");
  }

  // Handle save
  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveStatus("idle");
      
      const newSettings: Partial<AppSettings> = {
        autoDetectFestival: autoDetect,
        manualFestivalId: manualFestival,
        decorationIntensity: intensity[0] as 1 | 2 | 3 | 4 | 5,
        enableCherryBlossoms: cherryBlossoms,
        enableFestivalDecor: festivalDecor,
      };
      
      const updated = await updateSettings(newSettings);
      setSavedSettings(updated);
      setLastUpdated(new Date());
      setSaveStatus("success");
      
      // Exit preview mode if active
      if (previewMode) {
        exitPreview();
      }
      
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle reset button click
  function handleResetClick() {
    setResetDialogOpen(true);
  }
  
  // Handle reset confirmation
  async function handleResetConfirm() {
    try {
      setIsSaving(true);
      
      const defaults = await resetSettings();
      setSavedSettings(defaults);
      
      // Update form state
      setAutoDetect(defaults.autoDetectFestival);
      setManualFestival(defaults.manualFestivalId);
      setIntensity([defaults.decorationIntensity]);
      setCherryBlossoms(defaults.enableCherryBlossoms);
      setFestivalDecor(defaults.enableFestivalDecor);
      
      setLastUpdated(new Date());
      
      // Exit preview mode
      if (previewMode) {
        exitPreview();
      }
      
      toast.success("Settings reset to defaults");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsSaving(false);
      setResetDialogOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-64 bg-gray-100 rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-100 rounded" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-100 rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 rounded" />
                  <div className="h-20 bg-gray-100 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {testMode && (
        <Card className="border-amber-500 bg-amber-50 animate-in slide-in-from-top-2">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5 text-amber-600" />
              <div>
                <span className="font-medium text-amber-900">Test Mode Active</span>
                {simulatedDate && (
                  <span className="ml-2 text-sm text-amber-700">
                    Simulating: {simulatedDate.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleTestModeToggle}>
              Exit Test Mode
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Preview Banner */}
      {previewMode && !testMode && (
        <Card className="border-purple-500 bg-purple-50 animate-in slide-in-from-top-2">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Preview Mode Active</span>
            </div>
            <Button variant="outline" size="sm" onClick={exitPreview}>
              Exit Preview
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* KV Warning */}
      {kvConfigured === false && (
        <Card className="border-orange-500 bg-orange-50 animate-in slide-in-from-top-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">Persistent Storage Not Configured</p>
                <p className="text-sm text-orange-700 mt-1">
                  Settings are currently stored in local files and will not persist in serverless deployments.
                  Consider setting up Vercel KV for persistent storage.
                </p>
                <a
                  href="https://vercel.com/docs/storage/vercel-kv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-orange-800 hover:text-orange-900 mt-2 underline"
                >
                  Setup Instructions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls Section */}
        <div className="space-y-6">
          {/* Festival Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Festival Status
              </CardTitle>
              <CardDescription>
                Real-time festival detection and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Date */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Current Date:</span>
                </div>
                <span className="text-sm text-gray-900 font-medium">
                  {currentDate.toLocaleDateString("en-US", { 
                    weekday: "short",
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  })}
                </span>
              </div>
              
              {/* Active Festival Status */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Active Festival:</p>
                {activeFestival ? (
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className="text-base" 
                          style={{ 
                            backgroundColor: activeFestival.colors.primary,
                            borderColor: activeFestival.colors.secondary,
                          }}
                        >
                          {activeFestival.name}
                        </Badge>
                        {previewMode && <Badge variant="outline" className="text-xs">Preview</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activeFestival.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <EyeOff className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">No festival active</p>
                      <p className="text-xs text-gray-500 mt-1">
                        No festivals are currently detected for this date
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Next Festival */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Next Festival:</p>
                {nextFestivalData ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{nextFestivalData.festival.name}</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{nextFestivalData.festival.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Starts: {nextFestivalData.startDate.toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No upcoming festivals found</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Testing Tools */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5" />
                Testing Tools
              </CardTitle>
              <CardDescription>
                Test festival themes before applying to visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="test-mode" className="text-sm font-medium">
                    Test Mode
                  </Label>
                  <p className="text-xs text-gray-600">
                    Enable preview without saving changes
                  </p>
                </div>
                <Switch
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={handleTestModeToggle}
                />
              </div>
              
              {/* Date Simulator */}
              {testMode && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <Label htmlFor="simulate-date" className="text-sm font-medium">
                    Simulate Date
                  </Label>
                  <Input
                    id="simulate-date"
                    type="date"
                    value={simulatedDate?.toISOString().split("T")[0] ?? ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + "T00:00:00") : null;
                      setSimulatedDate(date);
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Override current date to test festival detection
                  </p>
                </div>
              )}
              
              <Separator />
              
              {/* Quick Festival Preview Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Quick Festival Preview:</p>
                <div className="grid grid-cols-2 gap-2">
                  {FESTIVALS.slice(0, 4).map((festival) => (
                    <Button
                      key={festival.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPreview(festival.id)}
                      disabled={isSaving}
                      className="justify-start text-xs"
                      style={{
                        borderColor: festival.colors.primary,
                        color: festival.colors.primary,
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      {festival.name}
                    </Button>
                  ))}
                </div>
                {FESTIVALS.length > 4 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {FESTIVALS.slice(4).map((festival) => (
                      <Button
                        key={festival.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPreview(festival.id)}
                        disabled={isSaving}
                        className="justify-start text-xs"
                        style={{
                          borderColor: festival.colors.primary,
                          color: festival.colors.primary,
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        {festival.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Festival Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Festival Detection
              </CardTitle>
              <CardDescription>
                Configure how festivals are detected and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-detect toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-detect" className="text-sm font-medium">
                    Auto-detect Festival
                  </Label>
                  <p className="text-sm text-gray-500">
                    Automatically detect based on current date
                  </p>
                </div>
                <Switch
                  id="auto-detect"
                  checked={autoDetect}
                  onCheckedChange={setAutoDetect}
                />
              </div>

              <Separator />

              {/* Manual festival selection */}
              <div className="space-y-2">
                <Label htmlFor="festival-select" className="text-sm font-medium">
                  Manual Festival Selection
                </Label>
                <Select
                  value={manualFestival ?? "none"}
                  onValueChange={(value) => setManualFestival(value === "none" ? null : value)}
                  disabled={autoDetect}
                >
                  <SelectTrigger id="festival-select">
                    <SelectValue placeholder="Select a festival" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {FESTIVALS.map((festival) => (
                      <SelectItem key={festival.id} value={festival.id}>
                        {festival.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!autoDetect && (
                  <p className="text-xs text-gray-500">
                    Manually select which festival theme to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Decorations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Decoration Settings
              </CardTitle>
              <CardDescription>
                Control decoration intensity and types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Intensity slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="intensity" className="text-sm font-medium">
                    Decoration Intensity
                  </Label>
                  <Badge variant="outline">{intensity[0]}</Badge>
                </div>
                <Slider
                  id="intensity"
                  min={1}
                  max={5}
                  step={1}
                  value={intensity}
                  onValueChange={setIntensity}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimal</span>
                  <span>Maximum</span>
                </div>
              </div>

              <Separator />

              {/* Cherry blossoms toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cherry-blossoms" className="text-sm font-medium">
                    Cherry Blossoms
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enable falling cherry blossom animations
                  </p>
                </div>
                <Switch
                  id="cherry-blossoms"
                  checked={cherryBlossoms}
                  onCheckedChange={setCherryBlossoms}
                />
              </div>

              <Separator />

              {/* Festival decorations toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="festival-decor" className="text-sm font-medium">
                    Festival Decorations
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enable festival-specific decorative elements
                  </p>
                </div>
                <Switch
                  id="festival-decor"
                  checked={festivalDecor}
                  onCheckedChange={setFestivalDecor}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-6">
              <Button
                onClick={handlePreview}
                variant="outline"
                disabled={isSaving || previewMode}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || previewMode}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Apply to Everyone
                  </>
                )}
              </Button>
              <Button
                onClick={handleResetClick}
                variant="outline"
                disabled={isSaving}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Auto
              </Button>
            </CardContent>
          </Card>

          {/* Save status */}
          {saveStatus === "success" && (
            <Card className="border-green-500 bg-green-50 animate-in slide-in-from-bottom-2">
              <CardContent className="flex items-center gap-2 py-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Settings saved successfully! All visitors will see the new configuration.
                </p>
              </CardContent>
            </Card>
          )}
          
          {saveStatus === "error" && (
            <Card className="border-red-500 bg-red-50 animate-in slide-in-from-bottom-2">
              <CardContent className="flex items-center gap-2 py-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  Failed to save settings. Please try again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Deployment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Deployment Status
              </CardTitle>
              <CardDescription>
                Storage configuration and persistence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Storage Status */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Storage Backend:</p>
                <div className="flex items-center gap-2">
                  {kvConfigured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Vercel KV (Persistent)
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        File System (Temporary)
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {kvConfigured 
                    ? "Settings persist across deployments"
                    : "Settings may be lost on serverless deployments"
                  }
                </p>
              </div>

              <Separator />

              {/* Environment Check */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Environment:</p>
                <Badge variant="outline">
                  {process.env.NODE_ENV === "production" ? "Production" : "Development"}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Last Updated:</p>
                <p className="text-sm text-gray-600">
                  {lastUpdated ? lastUpdated.toLocaleString() : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Current Visitor Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visitor Experience
              </CardTitle>
              <CardDescription>
                What visitors currently see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Active Festival:</p>
                {activeFestival ? (
                  <div className="space-y-2">
                    <Badge className="text-base" style={{ 
                      backgroundColor: activeFestival.colors.primary,
                      borderColor: activeFestival.colors.secondary,
                    }}>
                      {activeFestival.name}
                    </Badge>
                    <p className="text-sm text-gray-600">{activeFestival.description}</p>
                    {activeFestival.greeting && (
                      <p className="text-sm italic text-gray-500">{activeFestival.greeting}</p>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">No active festival</Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Detection Mode:</p>
                <Badge variant="outline">
                  {savedSettings?.autoDetectFestival ? "Automatic" : "Manual"}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Decorations:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={savedSettings?.enableCherryBlossoms ? "bg-green-50" : "bg-gray-50"}>
                    Cherry Blossoms: {savedSettings?.enableCherryBlossoms ? "On" : "Off"}
                  </Badge>
                  <Badge variant="outline" className={savedSettings?.enableFestivalDecor ? "bg-green-50" : "bg-gray-50"}>
                    Festival Decor: {savedSettings?.enableFestivalDecor ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          {activeFestival && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Preview
                </CardTitle>
                <CardDescription>
                  Preview of current festival theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color swatches */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Theme Colors:</p>
                  <div className="flex gap-2">
                    <div className="space-y-1">
                      <div
                        className="h-16 w-16 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: activeFestival.colors.primary }}
                        title="Primary"
                      />
                      <p className="text-xs text-center text-gray-600">Primary</p>
                    </div>
                    <div className="space-y-1">
                      <div
                        className="h-16 w-16 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: activeFestival.colors.secondary }}
                        title="Secondary"
                      />
                      <p className="text-xs text-center text-gray-600">Secondary</p>
                    </div>
                    <div className="space-y-1">
                      <div
                        className="h-16 w-16 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: activeFestival.colors.accent }}
                        title="Accent"
                      />
                      <p className="text-xs text-center text-gray-600">Accent</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sample decorations */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Decoration Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFestival.decorationType.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sample button with theme */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Sample Button:</p>
                  <Button
                    style={{
                      backgroundColor: activeFestival.colors.primary,
                      borderColor: activeFestival.colors.secondary,
                    }}
                    className="w-full"
                  >
                    Themed Button Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all settings to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all festival settings to their default values. All visitors will be affected by this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
