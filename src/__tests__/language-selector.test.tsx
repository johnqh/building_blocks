import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from '../components/topbar/language-selector';

const testLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

describe('LanguageSelector', () => {
  describe('compact variant', () => {
    it('renders with default props', () => {
      render(<LanguageSelector />);
      expect(
        screen.getByRole('button', { name: 'Select language' })
      ).toBeInTheDocument();
    });

    it('displays current language flag', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('opens dropdown on click', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      const button = screen.getByRole('button', { name: 'Select language' });
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('displays all languages in dropdown', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));

      expect(
        screen.getByRole('option', { name: /English/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /Español/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /Français/ })
      ).toBeInTheDocument();
    });

    it('calls onLanguageChange when selecting a different language', () => {
      const handleChange = vi.fn();
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage='en'
          onLanguageChange={handleChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
      fireEvent.click(screen.getByRole('option', { name: /Español/ }));

      expect(handleChange).toHaveBeenCalledWith('es');
    });

    it('does not call onLanguageChange when selecting current language', () => {
      const handleChange = vi.fn();
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage='en'
          onLanguageChange={handleChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
      fireEvent.click(screen.getByRole('option', { name: /English/ }));

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('closes dropdown after selection', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('option', { name: /Español/ }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes dropdown on escape key', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <LanguageSelector className='custom-class' />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('marks current language as selected', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));

      const englishOption = screen.getByRole('option', { name: /English/ });
      expect(englishOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('full variant', () => {
    it('renders label in full variant', () => {
      render(<LanguageSelector variant='full' label='Select Language' />);
      expect(screen.getByText('Select Language')).toBeInTheDocument();
    });

    it('renders helper text in full variant', () => {
      render(
        <LanguageSelector variant='full' helperText='Choose your language' />
      );
      expect(screen.getByText('Choose your language')).toBeInTheDocument();
    });

    it('opens dropdown in full variant', () => {
      render(
        <LanguageSelector
          variant='full'
          languages={testLanguages}
          currentLanguage='en'
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts languages alphabetically by name', () => {
      render(
        <LanguageSelector languages={testLanguages} currentLanguage='en' />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Select language' }));

      const options = screen.getAllByRole('option');
      // Español comes before English alphabetically, then Français
      expect(options[0]).toHaveTextContent('English');
      expect(options[1]).toHaveTextContent('Español');
      expect(options[2]).toHaveTextContent('Français');
    });
  });
});
