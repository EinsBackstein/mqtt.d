'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const sensorDataOptions = [
  'Temperatur',
  'Luftfeuchtigkeit',
  'Luftdruck',
  'Helligkeit',
  'Luftqualität',
] as const;

type ConfigurationFieldsProps = {
  dataType: typeof sensorDataOptions[number];
  index: number;
};

export const ConfigurationFields = ({ dataType, index }: ConfigurationFieldsProps) => {
  const { control, getValues, setValue } = useFormContext();

  switch (dataType) {
    case 'Temperatur':
      return (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Temperatur Konfiguration</h3>
          <div className="space-y-4">
            <FormField
              control={control}
              name={`configurations.${index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Einheit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Einheit wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {['°C', '°F', 'K'].map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`configurations.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Anzeigename" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`configurations.${index}.beschreibung`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Input placeholder="Optionale Beschreibung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Grenzwerte</FormLabel>
              {getValues(`configurations.${index}.grenzwerte`)
                ?.map((_: unknown, thresholdIndex: number) => (
                  <div
                    key={thresholdIndex}
                    className="space-y-2 border p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        Grenzwert #{thresholdIndex + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const current = getValues(
                            `configurations.${index}.grenzwerte`
                          );
                          setValue(
                            `configurations.${index}.grenzwerte`,
                            current?.filter((_: unknown, i: number) => i !== thresholdIndex)
                          );
                        }}
                      >
                        Entfernen
                      </Button>
                    </div>

                    <FormField
                      control={control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wert</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.color`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farbe</FormLabel>
                          <FormControl>
                            <Input
                              type="color"
                              {...field}
                              className="w-20 h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.send`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Alert senden:</FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.critical`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                          <FormLabel>Kritischer Alarm:</FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.message`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nachricht</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Alarmnachricht eingeben"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = getValues(`configurations.${index}.grenzwerte`) || [];
                  setValue(`configurations.${index}.grenzwerte`, [
                    ...current,
                    {
                      value: 0,
                      color: '#CF2430',
                      alert: {
                        send: true,
                        critical: false,
                        message: 'Temperaturgrenzwert erreicht',
                      },
                    },
                  ]);
                }}
              >
                + Grenzwert hinzufügen
              </Button>
            </div>
          </div>
        </div>
      );
    case 'Luftfeuchtigkeit':
      return (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Luftfeuchtigkeit Konfiguration</h3>
          <FormField
            control={control}
            name={`configurations.${index}.unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Einheit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string | undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Einheit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {['g/m³', '%'].map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`configurations.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Anzeigename" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`configurations.${index}.beschreibung`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl>
                  <Input placeholder="Optionale Beschreibung" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Grenzwerte</FormLabel>
            {getValues(`configurations.${index}.grenzwerte`)
              ?.map((_: unknown, thresholdIndex: number) => (
                <div
                  key={thresholdIndex}
                  className="space-y-2 border p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      Grenzwert #{thresholdIndex + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const current = getValues(
                          `configurations.${index}.grenzwerte`
                        );
                        setValue(
                          `configurations.${index}.grenzwerte`,
                          current?.filter((_: unknown, i: number) => i !== thresholdIndex)
                        );
                      }}
                    >
                      Entfernen
                    </Button>
                  </div>

                  <FormField
                    control={control}
                    name={`configurations.${index}.grenzwerte.${thresholdIndex}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wert</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`configurations.${index}.grenzwerte.${thresholdIndex}.color`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farbe</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            className="w-20 h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.send`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel>Alert senden:</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.critical`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel>Kritischer Alarm:</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`configurations.${index}.grenzwerte.${thresholdIndex}.alert.message`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nachricht</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Alarmnachricht eingeben"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = getValues(`configurations.${index}.grenzwerte`) || [];
                setValue(`configurations.${index}.grenzwerte`, [
                  ...current,
                  {
                    value: 0,
                    color: '#006FEE',
                    alert: {
                      send: true,
                      critical: false,
                      message: 'Luftfeuchtigkeits-Grenzwert erreicht',
                    },
                  },
                ]);
              }}
            >
              + Grenzwert hinzufügen
            </Button>
          </div>
        </div>
      );
    case 'Luftdruck':
      return <div>Luftdruck</div>;
    case 'Helligkeit':
      return <div>Helligkeit</div>;
    case 'Luftqualität':
      return <div>Luftqualität</div>;
    default:
      return null;
  }
};