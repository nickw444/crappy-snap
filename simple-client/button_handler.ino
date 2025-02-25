const int BUTTON_PIN = 4;           // GPIO4
const int HOLD_TIME = 2000;         // 2 seconds in milliseconds
const int DEBOUNCE_DELAY = 50;      // Debounce time in milliseconds

// Button state variables
bool lastButtonState = HIGH;         // Previous button reading
bool buttonState = HIGH;             // Current debounced state
unsigned long lastDebounceTime = 0;  // Last time button state changed
unsigned long buttonPressStart = 0;  // When the button was pressed
bool holdSent = false;              // Flag to prevent multiple hold triggers

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  // Read button with debouncing
  int reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading != buttonState) {
      buttonState = reading;

      if (buttonState == LOW) {  // Button pressed
        buttonPressStart = millis();
        holdSent = false;
      } else {  // Button released
        unsigned long pressDuration = millis() - buttonPressStart;
        
        if (!holdSent && pressDuration < HOLD_TIME) {
          // Short press
          Serial.println("TRIGGER:PRESS");
        }
      }
    }
  }

  // Check for hold while button is still pressed
  if (buttonState == LOW && !holdSent) {
    unsigned long pressDuration = millis() - buttonPressStart;
    if (pressDuration >= HOLD_TIME) {
      Serial.println("TRIGGER:HOLD");
      holdSent = true;
    }
  }

  lastButtonState = reading;
  delay(10);  // Small delay to prevent serial buffer overflow
} 