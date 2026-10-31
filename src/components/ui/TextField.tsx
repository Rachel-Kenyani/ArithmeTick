/**
 * The white 64px form field: purple icon, DynaPuff 18px text, pale-teal
 * hairline that turns teal on focus; plum border + a friendly line underneath on error.
 *
 *   <TextField label="Email or phone number" icon={<MailIcon />} placeholder="Enter Email or Phone Number"
 *              value={id} onChangeText={setId} error={idError} />
 *   <PasswordField label="Password" placeholder="Enter Password" textContentType="password" … />
 *
 * The visible prompt is the placeholder; `label` is the accessible name.
 */

export { fieldStyles, PLACEHOLDER_COLOR } from "./field/fieldStyles";
export { FieldMessage } from "./field/FieldMessage";
export { TextField, type TextFieldProps } from "./field/TextField";
export { PasswordField, type PasswordFieldProps } from "./field/PasswordField";
export { TextField as default } from "./field/TextField";
