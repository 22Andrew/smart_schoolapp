package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.model.AppCurrency;
import com.kantechsolution.smart_school.model.SchoolGeneralSetting;
import com.kantechsolution.smart_school.repository.AppCurrencyRepository;
import com.kantechsolution.smart_school.repository.SchoolGeneralSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Order(37)
public class AppCurrencyService implements ApplicationRunner {

    private static final String[][] DEFAULTS = {
            {"AED", "د.إ", "1"},
            {"AFN", "؋", "140"},
            {"ALL", "L", "1"},
            {"AMD", "֏", "1"},
            {"ANG", "ƒ", "1"},
            {"AOA", "Kz", "1"},
            {"ARS", "$", "1"},
            {"AUD", "A$", "1"},
            {"AWG", "ƒ", "1"},
            {"AZN", "₼", "1"},
            {"BAM", "KM", "1"},
            {"BBD", "$", "1"},
            {"BDT", "৳", "1"},
            {"BGN", "лв", "1"},
            {"BHD", ".د.ب", "1"},
            {"BIF", "FBu", "1"},
            {"BMD", "$", "1"},
            {"BND", "$", "1"},
            {"BOB", "Bs.", "1"},
            {"BRL", "R$", "1"},
            {"BSD", "$", "1"},
            {"BTN", "Nu.", "1"},
            {"BWP", "P", "1"},
            {"BYN", "Br", "1"},
            {"BZD", "$", "1"},
            {"CAD", "C$", "1"},
            {"CDF", "FC", "1"},
            {"CHF", "CHF", "1"},
            {"CLP", "$", "1"},
            {"CNY", "¥", "1"},
            {"COP", "$", "1"},
            {"CRC", "₡", "1"},
            {"CUP", "$", "1"},
            {"CVE", "$", "1"},
            {"CZK", "Kč", "1"},
            {"DJF", "Fdj", "1"},
            {"DKK", "kr", "1"},
            {"DOP", "RD$", "1"},
            {"DZD", "د.ج", "1"},
            {"EGP", "£", "1"},
            {"ERN", "Nfk", "1"},
            {"ETB", "Br", "1"},
            {"EUR", "€", "1"},
            {"FJD", "$", "1"},
            {"FKP", "£", "1"},
            {"GBP", "£", "1"},
            {"GEL", "₾", "1"},
            {"GHS", "₵", "1"},
            {"GIP", "£", "1"},
            {"GMD", "D", "1"},
            {"GNF", "FG", "1"},
            {"GTQ", "Q", "1"},
            {"GYD", "$", "1"},
            {"HKD", "HK$", "1"},
            {"HNL", "L", "1"},
            {"HTG", "G", "1"},
            {"HUF", "Ft", "1"},
            {"IDR", "Rp", "1"},
            {"ILS", "₪", "1"},
            {"INR", "₹", "1"},
            {"IQD", "ع.د", "1"},
            {"IRR", "﷼", "1"},
            {"ISK", "kr", "1"},
            {"JMD", "$", "1"},
            {"JOD", "د.ا", "1"},
            {"JPY", "¥", "1"},
            {"KES", "KSh", "1"},
            {"KGS", "сом", "1"},
            {"KHR", "៛", "1"},
            {"KMF", "CF", "1"},
            {"KPW", "₩", "1"},
            {"KRW", "₩", "1"},
            {"KWD", "د.ك", "1"},
            {"KYD", "$", "1"},
            {"KZT", "₸", "1"},
            {"LAK", "₭", "1"},
            {"LBP", "ل.ل", "1"},
            {"LKR", "Rs", "1"},
            {"LRD", "$", "1"},
            {"LSL", "L", "1"},
            {"LYD", "ل.د", "1"},
            {"MAD", "د.م.", "1"},
            {"MDL", "L", "1"},
            {"MGA", "Ar", "1"},
            {"MKD", "ден", "1"},
            {"MMK", "Ks", "1"},
            {"MNT", "₮", "1"},
            {"MOP", "P", "1"},
            {"MUR", "₨", "1"},
            {"MVR", "Rf", "1"},
            {"MWK", "MK", "1"},
            {"MXN", "$", "1"},
            {"MYR", "RM", "1"},
            {"MZN", "MT", "1"},
            {"NAD", "$", "1"},
            {"NGN", "₦", "1"},
            {"NIO", "C$", "1"},
            {"NOK", "kr", "1"},
            {"NPR", "₨", "1"},
            {"NZD", "NZ$", "1"},
            {"OMR", "ر.ع.", "1"},
            {"PAB", "B/.", "1"},
            {"PEN", "S/", "1"},
            {"PGK", "K", "1"},
            {"PHP", "₱", "1"},
            {"PKR", "₨", "1"},
            {"PLN", "zł", "1"},
            {"PYG", "₲", "1"},
            {"QAR", "ر.ق", "1"},
            {"RON", "lei", "1"},
            {"RSD", "дин", "1"},
            {"RUB", "₽", "1"},
            {"RWF", "FRw", "1"},
            {"SAR", "ر.س", "1"},
            {"SBD", "$", "1"},
            {"SCR", "₨", "1"},
            {"SDG", "ج.س.", "1"},
            {"SEK", "kr", "1"},
            {"SGD", "S$", "1"},
            {"SHP", "£", "1"},
            {"SLL", "Le", "1"},
            {"SOS", "Sh", "1"},
            {"SRD", "$", "1"},
            {"SZL", "L", "1"},
            {"THB", "฿", "1"},
            {"TJS", "ЅМ", "1"},
            {"TMT", "m", "1"},
            {"TND", "د.ت", "1"},
            {"TOP", "T$", "1"},
            {"TRY", "₺", "1"},
            {"TTD", "$", "1"},
            {"TWD", "NT$", "1"},
            {"TZS", "TSh", "1"},
            {"UAH", "₴", "1"},
            {"UGX", "USh", "1"},
            {"USD", "$", "1"},
            {"UYU", "$", "1"},
            {"UZS", "so'm", "1"},
            {"VES", "Bs.", "1"},
            {"VND", "₫", "1"},
            {"VUV", "Vt", "1"},
            {"WST", "T", "1"},
            {"XAF", "FCFA", "1"},
            {"XCD", "$", "1"},
            {"XOF", "CFA", "1"},
            {"XPF", "₣", "1"},
            {"YER", "﷼", "1"},
            {"ZAR", "R", "1"},
            {"ZMW", "ZK", "1"},
            {"ZWL", "$", "1"}
    };

    private final AppCurrencyRepository repository;
    private final SchoolGeneralSettingRepository schoolGeneralSettingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        for (String[] row : DEFAULTS) {
            boolean usd = "USD".equals(row[0]);
            AppCurrency currency = AppCurrency.builder()
                    .name(row[0])
                    .shortCode(row[0])
                    .symbol(row[1])
                    .conversionRate(new BigDecimal(row[2]))
                    .isBase(usd)
                    .isCurrent(usd)
                    .isEnabled(true)
                    .build();
            currency.setIsActive(true);
            repository.save(currency);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAll() {
        return repository.findAllByOrderByShortCodeAsc().stream().map(this::toMap).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getActiveConfig() {
        AppCurrency active = repository.findFirstByIsCurrentTrue()
                .orElseGet(() -> repository.findFirstByIsBaseTrue()
                        .orElseThrow(() -> new IllegalStateException("No currency configured")));
        AppCurrency base = repository.findFirstByIsBaseTrue().orElse(active);
        String currencyFormat = schoolGeneralSettingRepository.findAll().stream()
                .findFirst()
                .map(SchoolGeneralSetting::getCurrencyFormat)
                .orElse("12,345,678.00");

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("shortCode", active.getShortCode());
        map.put("symbol", active.getSymbol());
        map.put("name", active.getName());
        map.put("conversionRate", active.getConversionRate() == null
                ? "1" : active.getConversionRate().stripTrailingZeros().toPlainString());
        map.put("baseShortCode", base.getShortCode());
        map.put("baseConversionRate", base.getConversionRate() == null
                ? "1" : base.getConversionRate().stripTrailingZeros().toPlainString());
        map.put("currencyFormat", currencyFormat);
        return map;
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> payload) {
        AppCurrency currency = requireCurrency(id);
        if (payload.containsKey("symbol")) {
            currency.setSymbol(required(payload.get("symbol"), "Currency symbol"));
        }
        if (payload.containsKey("conversionRate")) {
            currency.setConversionRate(rate(payload.get("conversionRate")));
        }
        if (payload.containsKey("isEnabled")) {
            boolean enabled = bool(payload.get("isEnabled"));
            if (!enabled && (Boolean.TRUE.equals(currency.getIsBase()) || Boolean.TRUE.equals(currency.getIsCurrent()))) {
                throw new IllegalArgumentException("Base or active currency cannot be disabled");
            }
            currency.setIsEnabled(enabled);
        }
        return toMap(repository.save(currency));
    }

    @Transactional
    public Map<String, Object> setBase(Long id) {
        AppCurrency currency = requireCurrency(id);
        if (!Boolean.TRUE.equals(currency.getIsEnabled())) {
            throw new IllegalArgumentException("Enable the currency before setting it as base");
        }
        repository.findAll().forEach(item -> {
            if (Boolean.TRUE.equals(item.getIsBase())) {
                item.setIsBase(false);
                repository.save(item);
            }
        });
        currency.setIsBase(true);
        currency.setIsEnabled(true);
        currency.setConversionRate(BigDecimal.ONE);
        return toMap(repository.save(currency));
    }

    @Transactional
    public Map<String, Object> activate(Long id) {
        AppCurrency currency = requireCurrency(id);
        if (!Boolean.TRUE.equals(currency.getIsEnabled())) {
            throw new IllegalArgumentException("Enable the currency before setting it active");
        }
        repository.findAll().forEach(item -> {
            if (Boolean.TRUE.equals(item.getIsCurrent())) {
                item.setIsCurrent(false);
                repository.save(item);
            }
        });
        currency.setIsCurrent(true);
        currency.setIsEnabled(true);
        return toMap(repository.save(currency));
    }

    private AppCurrency requireCurrency(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Currency not found"));
    }

    private Map<String, Object> toMap(AppCurrency currency) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", currency.getId());
        map.put("name", currency.getName());
        map.put("shortCode", currency.getShortCode());
        map.put("symbol", currency.getSymbol());
        map.put("conversionRate", currency.getConversionRate() == null ? "1" : currency.getConversionRate().stripTrailingZeros().toPlainString());
        map.put("isBase", Boolean.TRUE.equals(currency.getIsBase()));
        map.put("isCurrent", Boolean.TRUE.equals(currency.getIsCurrent()));
        map.put("isEnabled", Boolean.TRUE.equals(currency.getIsEnabled()));
        return map;
    }

    private static BigDecimal rate(Object value) {
        String text = value == null ? "" : value.toString().trim();
        if (text.isBlank()) {
            throw new IllegalArgumentException("Conversion rate is required");
        }
        try {
            BigDecimal rate = new BigDecimal(text);
            if (rate.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Conversion rate must be greater than 0");
            }
            return rate;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Conversion rate must be a number");
        }
    }

    private static boolean bool(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        String text = value == null ? "" : value.toString().trim().toLowerCase();
        return "true".equals(text) || "1".equals(text) || "on".equals(text) || "yes".equals(text);
    }

    private static String required(Object value, String field) {
        String text = value == null ? "" : value.toString().trim();
        if (text.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return text;
    }
}
