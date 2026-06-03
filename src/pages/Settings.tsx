import { useTranslation } from 'react-i18next';
import { useSettings, ThemeMode, AccentColor } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sun, Moon, Monitor, Palette, Type, RefreshCw, Layout } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();
  const { settings, updateSettings, resetSettings, toggleWidget } = useSettings();

  const accentColors: { value: AccentColor; label: string; color: string }[] = [
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'purple', label: 'Purple', color: '#a855f7' },
    { value: 'green', label: 'Green', color: '#22c55e' },
    { value: 'orange', label: 'Orange', color: '#f97316' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
    { value: 'red', label: 'Red', color: '#ef4444' },
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[settings.theme];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Customize your experience and manage your preferences
        </p>
      </div>

      <Separator />

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((theme) => {
                const Icon = themeIcons[theme];
                return (
                  <Button
                    key={theme}
                    variant={settings.theme === theme ? 'default' : 'outline'}
                    className="flex items-center gap-2"
                    onClick={() => updateSettings({ theme })}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="capitalize">{theme}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="grid grid-cols-6 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ accentColor: color.value })}
                  className={`h-12 rounded-md border-2 transition-all ${
                    settings.accentColor === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size
            </Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                updateSettings({ fontSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard Widgets
          </CardTitle>
          <CardDescription>Choose which tools appear on your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(settings.dashboardWidgets).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="cursor-pointer capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Switch
                  id={key}
                  checked={enabled}
                  onCheckedChange={() => toggleWidget(key as keyof typeof settings.dashboardWidgets)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>General application preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="welcome-message" className="cursor-pointer">
              Show welcome message on dashboard
            </Label>
            <Switch
              id="welcome-message"
              checked={settings.showWelcomeMessage}
              onCheckedChange={(checked) => updateSettings({ showWelcomeMessage: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sidebar-collapsed" className="cursor-pointer">
              Collapse sidebar by default
            </Label>
            <Switch
              id="sidebar-collapsed"
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) => updateSettings({ sidebarCollapsed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <RefreshCw className="h-5 w-5" />
            Reset Settings
          </CardTitle>
          <CardDescription>Restore all settings to their default values</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={resetSettings}>
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
