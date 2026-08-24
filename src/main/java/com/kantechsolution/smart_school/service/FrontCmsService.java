package com.kantechsolution.smart_school.service;

import com.kantechsolution.smart_school.config.UploadStorage;
import com.kantechsolution.smart_school.model.*;
import com.kantechsolution.smart_school.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Order(22)
public class FrontCmsService implements ApplicationRunner {

    private final FrontCmsMediaRepository mediaRepository;
    private final FrontCmsGalleryRepository galleryRepository;
    private final FrontCmsNewsRepository newsRepository;
    private final FrontCmsPageRepository pageRepository;
    private final FrontCmsMenuRepository menuRepository;
    private final FrontCmsMenuItemRepository menuItemRepository;
    private final FrontCmsBannerRepository bannerRepository;
    private final UploadStorage uploadStorage;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (pageRepository.count() == 0) {
            seedPage("Home", "home", "STANDARD", true);
            seedPage("Complain", "complain", "STANDARD", true);
            seedPage("Contact Us", "contact", "STANDARD", true);
            seedPage("404 Page", "404", "STANDARD", true);
        }
        if (menuRepository.count() == 0) {
            seedMenu("Main Menu", "Primary website menu", true);
            seedMenu("Bottom Menu", "Footer website menu", true);
        }
        if (menuItemRepository.count() == 0) {
            seedDefaultMenuItems();
        }
        if (galleryRepository.count() == 0) {
            FrontCmsGallery gallery = FrontCmsGallery.builder()
                    .title("Annual Day Gallery")
                    .description("Photos from the school annual day celebration.")
                    .showSidebar(true)
                    .build();
            gallery.setIsActive(true);
            galleryRepository.save(gallery);
        }
        if (newsRepository.count() == 0) {
            seedNews("National Level Workshop for Science Teachers Teaching in Class X to XII (Online)",
                    LocalDate.of(2026, 3, 20),
                    "A two-day capacity building programme was organised for science teachers to strengthen classroom practices.");
            seedNews("New Books Added to Library", LocalDate.of(2026, 3, 18),
                    "The school library has added new educational and reference books.");
            seedNews("Unit Test Schedule Released", LocalDate.of(2026, 3, 5),
                    "The schedule for the upcoming unit test has been published.");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMedia() {
        return mediaRepository.findAllByOrderByIdDesc().stream().map(this::mediaMap).toList();
    }

    @Transactional
    public Map<String, Object> saveMedia(MultipartFile file, String youtubeUrl) {
        String youtube = text(youtubeUrl);
        if ((file == null || file.isEmpty()) && youtube.isBlank()) {
            throw new IllegalArgumentException("Choose a file or enter a YouTube URL");
        }
        FrontCmsMedia media = new FrontCmsMedia();
        if (!youtube.isBlank()) {
            media.setYoutubeUrl(youtube);
            media.setFileName("youtube.mp4");
            media.setFileUrl(youtube);
            media.setFileType("video");
        }
        if (file != null && !file.isEmpty()) {
            String url = storeFile(file);
            media.setFileName(file.getOriginalFilename());
            media.setFileUrl(url);
            media.setFileType(detectType(file.getOriginalFilename(), null));
            media.setYoutubeUrl(null);
        }
        media.setIsActive(true);
        return mediaMap(mediaRepository.save(media));
    }

    @Transactional
    public void deleteMedia(Long id) {
        mediaRepository.delete(requireMedia(id));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listGalleries() {
        return galleryRepository.findAllByOrderByIdDesc().stream().map(this::galleryMap).toList();
    }

    @Transactional
    public Map<String, Object> saveGallery(Long id, Map<String, Object> body) {
        String title = text(body.get("title"));
        if (title.isBlank()) throw new IllegalArgumentException("Title is required");
        FrontCmsGallery row = id == null ? new FrontCmsGallery() : requireGallery(id);
        row.setTitle(title);
        row.setDescription(text(body.get("description")));
        row.setGalleryImages(text(body.get("galleryImages")));
        row.setShowSidebar(bool(body.get("showSidebar"), true));
        row.setMetaTitle(text(body.get("metaTitle")));
        row.setMetaKeyword(text(body.get("metaKeyword")));
        row.setMetaDescription(text(body.get("metaDescription")));
        if (bool(body.get("removeImage"), false)) row.setImageUrl(null);
        if (row.getIsActive() == null) row.setIsActive(true);
        return galleryMap(galleryRepository.save(row));
    }

    @Transactional
    public Map<String, Object> storeGalleryImage(Long id, MultipartFile file, boolean featured) {
        FrontCmsGallery row = requireGallery(id);
        String url = storeFile(file);
        if (featured) {
            row.setImageUrl(url);
        } else {
            List<String> images = splitImages(row.getGalleryImages());
            images.add(url);
            row.setGalleryImages(String.join(",", images));
        }
        return galleryMap(galleryRepository.save(row));
    }

    @Transactional
    public void deleteGallery(Long id) {
        galleryRepository.delete(requireGallery(id));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listNews() {
        return newsRepository.findAllByOrderByNewsDateDescIdDesc().stream().map(this::newsMap).toList();
    }

    @Transactional
    public Map<String, Object> saveNews(Long id, Map<String, Object> body) {
        String title = text(body.get("title"));
        LocalDate date = dateVal(body.get("newsDate") != null ? body.get("newsDate") : body.get("date"));
        if (title.isBlank()) throw new IllegalArgumentException("Title is required");
        if (date == null) throw new IllegalArgumentException("Date is required");
        FrontCmsNews row = id == null ? new FrontCmsNews() : requireNews(id);
        row.setTitle(title);
        row.setNewsDate(date);
        row.setDescription(text(body.get("description")));
        row.setShowSidebar(bool(body.get("showSidebar"), true));
        row.setMetaTitle(text(body.get("metaTitle")));
        row.setMetaKeyword(text(body.get("metaKeyword")));
        row.setMetaDescription(text(body.get("metaDescription")));
        if (bool(body.get("removeImage"), false)) row.setImageUrl(null);
        if (row.getIsActive() == null) row.setIsActive(true);
        return newsMap(newsRepository.save(row));
    }

    @Transactional
    public Map<String, Object> storeNewsImage(Long id, MultipartFile file) {
        FrontCmsNews row = requireNews(id);
        row.setImageUrl(storeFile(file));
        return newsMap(newsRepository.save(row));
    }

    @Transactional
    public void deleteNews(Long id) {
        newsRepository.delete(requireNews(id));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPages() {
        return pageRepository.findAllByOrderByIdAsc().stream().map(this::pageMap).toList();
    }

    @Transactional
    public Map<String, Object> savePage(Long id, Map<String, Object> body) {
        String title = text(body.get("title"));
        if (title.isBlank()) throw new IllegalArgumentException("Title is required");
        FrontCmsPage row = id == null ? new FrontCmsPage() : requirePage(id);
        row.setTitle(title);
        String slug = text(body.get("slug"));
        row.setSlug(slug.isBlank() ? slugify(title) : slugify(slug));
        String type = text(body.get("pageType")).toUpperCase(Locale.ROOT);
        if (type.isBlank()) type = "STANDARD";
        if (!Set.of("STANDARD", "EVENTS", "NEWS", "GALLERY").contains(type)) {
            throw new IllegalArgumentException("Invalid page type");
        }
        if (!Boolean.TRUE.equals(row.getSystemPage())) {
            row.setPageType(type);
        }
        row.setDescription(text(body.get("description")));
        row.setShowSidebar(bool(body.get("showSidebar"), true));
        row.setMetaTitle(text(body.get("metaTitle")));
        row.setMetaKeyword(text(body.get("metaKeyword")));
        row.setMetaDescription(text(body.get("metaDescription")));
        if (bool(body.get("removeImage"), false)) row.setImageUrl(null);
        if (row.getIsActive() == null) row.setIsActive(true);
        if (row.getSystemPage() == null) row.setSystemPage(false);
        return pageMap(pageRepository.save(row));
    }

    @Transactional
    public Map<String, Object> storePageImage(Long id, MultipartFile file) {
        FrontCmsPage row = requirePage(id);
        row.setImageUrl(storeFile(file));
        return pageMap(pageRepository.save(row));
    }

    @Transactional
    public void deletePage(Long id) {
        FrontCmsPage row = requirePage(id);
        if (Boolean.TRUE.equals(row.getSystemPage())) {
            throw new IllegalArgumentException("Default pages cannot be deleted");
        }
        pageRepository.delete(row);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMenus() {
        return menuRepository.findAllByOrderByIdAsc().stream().map(this::menuMap).toList();
    }

    @Transactional
    public Map<String, Object> saveMenu(Long id, Map<String, Object> body) {
        String name = text(body.get("name") != null ? body.get("name") : body.get("title"));
        if (name.isBlank()) throw new IllegalArgumentException("Menu is required");
        FrontCmsMenu row = id == null ? new FrontCmsMenu() : requireMenu(id);
        if (Boolean.TRUE.equals(row.getSystemMenu()) && id != null) {
            row.setDescription(text(body.get("description")));
        } else {
            row.setName(name);
            row.setDescription(text(body.get("description")));
        }
        if (row.getSystemMenu() == null) row.setSystemMenu(false);
        if (row.getIsActive() == null) row.setIsActive(true);
        return menuMap(menuRepository.save(row));
    }

    @Transactional
    public void deleteMenu(Long id) {
        FrontCmsMenu row = requireMenu(id);
        if (Boolean.TRUE.equals(row.getSystemMenu())) {
            throw new IllegalArgumentException("Default menus cannot be deleted");
        }
        menuItemRepository.findByMenuIdOrderBySortOrderAscIdAsc(id).forEach(menuItemRepository::delete);
        menuRepository.delete(row);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listMenuItems(Long menuId) {
        requireMenu(menuId);
        return menuItemRepository.findByMenuIdOrderBySortOrderAscIdAsc(menuId).stream().map(this::menuItemMap).toList();
    }

    @Transactional
    public Map<String, Object> saveMenuItem(Long id, Map<String, Object> body) {
        Long menuId = longVal(body.get("menuId"));
        String title = text(body.get("title"));
        if (menuId == null) throw new IllegalArgumentException("Menu is required");
        if (title.isBlank()) throw new IllegalArgumentException("Menu item is required");
        requireMenu(menuId);
        FrontCmsMenuItem row = id == null ? new FrontCmsMenuItem() : requireMenuItem(id);
        row.setMenuId(menuId);
        row.setTitle(title);
        boolean external = bool(body.get("external"), false);
        row.setExternalUrl(external ? text(body.get("externalUrl")) : null);
        row.setPageId(external ? null : longVal(body.get("pageId")));
        row.setOpenNewTab(bool(body.get("openNewTab"), false));
        Long parentId = longVal(body.get("parentId"));
        if (parentId != null) {
            FrontCmsMenuItem parent = requireMenuItem(parentId);
            if (!Objects.equals(parent.getMenuId(), menuId)) {
                throw new IllegalArgumentException("Parent menu item is invalid");
            }
            if (id != null && (Objects.equals(parentId, id) || wouldCycle(id, parentId))) {
                throw new IllegalArgumentException("Parent menu item is invalid");
            }
        }
        row.setParentId(parentId);
        if (row.getSortOrder() == null) {
            long siblings = menuItemRepository.findByMenuIdOrderBySortOrderAscIdAsc(menuId).stream()
                    .filter(item -> Objects.equals(item.getParentId(), parentId))
                    .count();
            row.setSortOrder((int) siblings + 1);
        }
        if (row.getIsActive() == null) row.setIsActive(true);
        return menuItemMap(menuItemRepository.save(row));
    }

    @Transactional
    public void moveMenuItem(Long id, String direction) {
        FrontCmsMenuItem item = requireMenuItem(id);
        List<FrontCmsMenuItem> items = menuItemRepository.findByMenuIdOrderBySortOrderAscIdAsc(item.getMenuId()).stream()
                .filter(row -> Objects.equals(row.getParentId(), item.getParentId()))
                .toList();
        int index = -1;
        for (int i = 0; i < items.size(); i++) {
            if (Objects.equals(items.get(i).getId(), id)) index = i;
        }
        int swapWith = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
        if (index < 0 || swapWith < 0 || swapWith >= items.size()) return;
        FrontCmsMenuItem other = items.get(swapWith);
        Integer left = item.getSortOrder();
        item.setSortOrder(other.getSortOrder());
        other.setSortOrder(left == null ? index + 1 : left);
        menuItemRepository.save(item);
        menuItemRepository.save(other);
    }

    @Transactional
    public void reorderMenuItems(Long menuId, Map<String, Object> body) {
        requireMenu(menuId);
        Object raw = body == null ? null : body.get("items");
        if (!(raw instanceof List<?> rows)) return;
        for (Object rowObj : rows) {
            if (!(rowObj instanceof Map<?, ?> rowMap)) continue;
            @SuppressWarnings("unchecked")
            Map<String, Object> row = (Map<String, Object>) rowMap;
            Long id = longVal(row.get("id"));
            if (id == null) continue;
            FrontCmsMenuItem item = requireMenuItem(id);
            if (!Objects.equals(item.getMenuId(), menuId)) continue;
            Long parentId = longVal(row.get("parentId"));
            if (parentId != null && Objects.equals(parentId, id)) parentId = null;
            item.setParentId(parentId);
            Integer order = intVal(row.get("sortOrder"));
            item.setSortOrder(order == null ? 0 : order);
            menuItemRepository.save(item);
        }
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        FrontCmsMenuItem item = requireMenuItem(id);
        deleteMenuItemChildren(id);
        menuItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listBanners() {
        return bannerRepository.findAllByOrderByIdDesc().stream().map(this::bannerMap).toList();
    }

    @Transactional
    public Map<String, Object> saveBanner(Long mediaId) {
        if (mediaId == null) throw new IllegalArgumentException("Select a media file");
        FrontCmsMedia media = requireMedia(mediaId);
        FrontCmsBanner banner = FrontCmsBanner.builder()
                .mediaId(media.getId())
                .imageUrl(media.getFileUrl())
                .fileName(media.getFileName())
                .build();
        banner.setIsActive(true);
        return bannerMap(bannerRepository.save(banner));
    }

    @Transactional
    public Map<String, Object> saveBanners(Map<String, Object> body) {
        List<Long> ids = new ArrayList<>();
        Object raw = body == null ? null : body.get("mediaIds");
        if (raw instanceof List<?> list) {
            for (Object value : list) {
                Long id = longVal(value);
                if (id != null) ids.add(id);
            }
        }
        Long single = longVal(body == null ? null : body.get("mediaId"));
        if (single != null) ids.add(single);
        ids = ids.stream().distinct().toList();
        if (ids.isEmpty()) throw new IllegalArgumentException("Select a media file");
        int added = 0;
        Map<String, Object> last = Map.of();
        for (Long id : ids) {
            if (bannerRepository.existsByMediaId(id)) continue;
            last = saveBanner(id);
            added++;
        }
        if (added == 0) throw new IllegalArgumentException("Selected images are already added");
        Map<String, Object> result = new LinkedHashMap<>(last);
        result.put("count", added);
        return result;
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.delete(bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found")));
    }

    public Map<String, Object> storeEditorMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is required");
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("url", storeFile(file));
        map.put("name", file.getOriginalFilename());
        return map;
    }

    private void seedPage(String title, String slug, String type, boolean system) {
        FrontCmsPage page = FrontCmsPage.builder()
                .title(title)
                .slug(slug)
                .pageType(type)
                .systemPage(system)
                .showSidebar(true)
                .build();
        page.setIsActive(true);
        pageRepository.save(page);
    }

    private void seedDefaultMenuItems() {
        FrontCmsMenu main = menuRepository.findFirstByNameIgnoreCase("Main Menu").orElse(null);
        FrontCmsMenu bottom = menuRepository.findFirstByNameIgnoreCase("Bottom Menu").orElse(null);
        if (main == null) return;

        Long home = ensurePage("Home", "home").getId();
        Long onlineCourse = ensurePage("Online Course", "online-course").getId();
        Long onlineAdmission = ensurePage("Online Admission", "online-admission").getId();
        Long cbseResult = ensurePage("CBSE Exam Result", "cbse-exam-result").getId();
        Long examResult = ensurePage("Exam Result", "exam-result").getId();
        Long annualCalendar = ensurePage("Annual Calendar", "annual-calendar").getId();
        Long aboutUs = ensurePage("About Us", "about-us").getId();
        Long facilities = ensurePage("Facilities", "facilities").getId();
        Long sportsDay = ensurePage("Annual Sports Day", "annual-sports-day").getId();
        Long course = ensurePage("Course", "course").getId();
        Long uniform = ensurePage("School Uniform", "school-uniform").getId();
        Long principal = ensurePage("Principal Message", "principal-message").getId();
        Long contact = ensurePage("Contact Us", "contact").getId();

        seedMenuItem(main.getId(), "Home", home, null, 1);
        seedMenuItem(main.getId(), "Online Course", onlineCourse, null, 2);
        seedMenuItem(main.getId(), "Online Admission", onlineAdmission, null, 3);
        seedMenuItem(main.getId(), "CBSE Exam Result", cbseResult, null, 4);
        seedMenuItem(main.getId(), "Exam Result", examResult, null, 5);
        seedMenuItem(main.getId(), "Annual Calendar", annualCalendar, null, 6);
        seedMenuItem(main.getId(), "About Us", aboutUs, null, 7);
        FrontCmsMenuItem academics = seedMenuItem(main.getId(), "Academics", null, null, 8);
        seedMenuItem(main.getId(), "Facilities", facilities, academics.getId(), 1);
        seedMenuItem(main.getId(), "Annual Sports Day", sportsDay, academics.getId(), 2);
        seedMenuItem(main.getId(), "Course", course, academics.getId(), 3);
        seedMenuItem(main.getId(), "School Uniform", uniform, academics.getId(), 4);
        seedMenuItem(main.getId(), "Principal Message", principal, academics.getId(), 5);

        if (bottom != null) {
            seedMenuItem(bottom.getId(), "Home", home, null, 1);
            seedMenuItem(bottom.getId(), "About Us", aboutUs, null, 2);
            seedMenuItem(bottom.getId(), "Contact Us", contact, null, 3);
        }
    }

    private FrontCmsPage ensurePage(String title, String slug) {
        return pageRepository.findFirstBySlugIgnoreCase(slug).orElseGet(() -> {
            FrontCmsPage page = FrontCmsPage.builder()
                    .title(title)
                    .slug(slug)
                    .pageType("STANDARD")
                    .systemPage(false)
                    .showSidebar(true)
                    .build();
            page.setIsActive(true);
            return pageRepository.save(page);
        });
    }

    private FrontCmsMenuItem seedMenuItem(Long menuId, String title, Long pageId, Long parentId, int order) {
        FrontCmsMenuItem item = FrontCmsMenuItem.builder()
                .menuId(menuId)
                .title(title)
                .pageId(pageId)
                .parentId(parentId)
                .sortOrder(order)
                .openNewTab(false)
                .build();
        item.setIsActive(true);
        return menuItemRepository.save(item);
    }

    private void seedMenu(String name, String description, boolean system) {
        FrontCmsMenu menu = FrontCmsMenu.builder()
                .name(name)
                .description(description)
                .systemMenu(system)
                .build();
        menu.setIsActive(true);
        menuRepository.save(menu);
    }

    private void seedNews(String title, LocalDate date, String description) {
        FrontCmsNews news = FrontCmsNews.builder()
                .title(title)
                .newsDate(date)
                .description(description)
                .showSidebar(true)
                .build();
        news.setIsActive(true);
        newsRepository.save(news);
    }

    private FrontCmsMedia requireMedia(Long id) {
        return mediaRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Media not found"));
    }

    private FrontCmsGallery requireGallery(Long id) {
        return galleryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Gallery not found"));
    }

    private FrontCmsNews requireNews(Long id) {
        return newsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("News not found"));
    }

    private FrontCmsPage requirePage(Long id) {
        return pageRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Page not found"));
    }

    private FrontCmsMenu requireMenu(Long id) {
        return menuRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Menu not found"));
    }

    private FrontCmsMenuItem requireMenuItem(Long id) {
        return menuItemRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Menu item not found"));
    }

    private void deleteMenuItemChildren(Long parentId) {
        menuItemRepository.findByParentIdOrderBySortOrderAscIdAsc(parentId).forEach(child -> {
            deleteMenuItemChildren(child.getId());
            menuItemRepository.delete(child);
        });
    }

    private boolean wouldCycle(Long itemId, Long parentId) {
        Long current = parentId;
        Set<Long> seen = new HashSet<>();
        while (current != null && seen.add(current)) {
            if (Objects.equals(current, itemId)) return true;
            FrontCmsMenuItem parent = menuItemRepository.findById(current).orElse(null);
            if (parent == null) return false;
            current = parent.getParentId();
        }
        return false;
    }

    private Map<String, Object> mediaMap(FrontCmsMedia row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("fileName", row.getFileName());
        map.put("fileUrl", row.getFileUrl());
        map.put("fileType", row.getFileType());
        map.put("youtubeUrl", row.getYoutubeUrl());
        return map;
    }

    private Map<String, Object> galleryMap(FrontCmsGallery row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("title", row.getTitle());
        map.put("description", row.getDescription());
        map.put("imageUrl", row.getImageUrl());
        map.put("galleryImages", splitImages(row.getGalleryImages()));
        map.put("showSidebar", Boolean.TRUE.equals(row.getShowSidebar()));
        map.put("metaTitle", row.getMetaTitle());
        map.put("metaKeyword", row.getMetaKeyword());
        map.put("metaDescription", row.getMetaDescription());
        return map;
    }

    private Map<String, Object> newsMap(FrontCmsNews row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("title", row.getTitle());
        map.put("newsDate", row.getNewsDate());
        map.put("date", row.getNewsDate());
        map.put("description", row.getDescription());
        map.put("imageUrl", row.getImageUrl());
        map.put("showSidebar", Boolean.TRUE.equals(row.getShowSidebar()));
        map.put("metaTitle", row.getMetaTitle());
        map.put("metaKeyword", row.getMetaKeyword());
        map.put("metaDescription", row.getMetaDescription());
        return map;
    }

    private Map<String, Object> pageMap(FrontCmsPage row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("title", row.getTitle());
        map.put("slug", row.getSlug());
        map.put("url", "/" + (row.getSlug() == null ? "" : row.getSlug()));
        map.put("pageType", row.getPageType());
        map.put("description", row.getDescription());
        map.put("imageUrl", row.getImageUrl());
        map.put("showSidebar", Boolean.TRUE.equals(row.getShowSidebar()));
        map.put("systemPage", Boolean.TRUE.equals(row.getSystemPage()));
        map.put("metaTitle", row.getMetaTitle());
        map.put("metaKeyword", row.getMetaKeyword());
        map.put("metaDescription", row.getMetaDescription());
        return map;
    }

    private Map<String, Object> menuMap(FrontCmsMenu row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("name", row.getName());
        map.put("title", row.getName());
        map.put("description", row.getDescription());
        map.put("systemMenu", Boolean.TRUE.equals(row.getSystemMenu()));
        map.put("itemCount", menuItemRepository.findByMenuIdOrderBySortOrderAscIdAsc(row.getId()).size());
        return map;
    }

    private Map<String, Object> menuItemMap(FrontCmsMenuItem row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("menuId", row.getMenuId());
        map.put("parentId", row.getParentId());
        map.put("title", row.getTitle());
        map.put("pageId", row.getPageId());
        map.put("externalUrl", row.getExternalUrl());
        map.put("external", row.getExternalUrl() != null && !row.getExternalUrl().isBlank());
        map.put("openNewTab", Boolean.TRUE.equals(row.getOpenNewTab()));
        map.put("sortOrder", row.getSortOrder());
        if (row.getPageId() != null) {
            pageRepository.findById(row.getPageId()).ifPresent(page -> map.put("pageTitle", page.getTitle()));
        }
        return map;
    }

    private Map<String, Object> bannerMap(FrontCmsBanner row) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", row.getId());
        map.put("mediaId", row.getMediaId());
        map.put("imageUrl", row.getImageUrl());
        map.put("fileName", row.getFileName());
        return map;
    }

    private String storeFile(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String extension = "";
        if (originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        try {
            Path uploadDir = uploadStorage.getMediaDir();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/media/" + filename;
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to store file: " + e.getMessage());
        }
    }

    private static List<String> splitImages(String value) {
        if (value == null || value.isBlank()) return new ArrayList<>();
        List<String> list = new ArrayList<>();
        for (String part : value.split(",")) {
            if (!part.isBlank()) list.add(part.trim());
        }
        return list;
    }

    private static String detectType(String name, String youtube) {
        if (youtube != null && !youtube.isBlank()) return "video";
        String ext = "";
        if (name != null && name.contains(".")) {
            ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        }
        if (Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "jfif").contains(ext)) return "image";
        if (Set.of("mp4", "webm", "avi", "mov", "mkv").contains(ext)) return "video";
        if (Set.of("txt", "rtf").contains(ext)) return "text";
        if (Set.of("zip", "7z").contains(ext)) return "zip";
        if ("rar".equals(ext)) return "rar";
        if ("pdf".equals(ext)) return "pdf";
        if (Set.of("doc", "docx").contains(ext)) return "word";
        if (Set.of("xls", "xlsx", "csv").contains(ext)) return "excel";
        return "other";
    }

    private static String slugify(String value) {
        return text(value).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static boolean bool(Object value, boolean fallback) {
        if (value == null || text(value).isBlank()) return fallback;
        if (value instanceof Boolean flag) return flag;
        String text = text(value).toLowerCase(Locale.ROOT);
        return "true".equals(text) || "1".equals(text) || "yes".equals(text);
    }

    private static Long longVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer intVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static LocalDate dateVal(Object value) {
        String text = text(value);
        if (text.isBlank()) return null;
        return LocalDate.parse(text.contains("T") ? text.substring(0, 10) : text);
    }
}
