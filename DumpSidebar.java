import com.kantechsolution.smart_school.service.SidebarMenuCatalogLoader;
import java.util.Map;
import java.util.List;

public class DumpSidebar {
    public static void main(String[] args) {
        SidebarMenuCatalogLoader loader = new SidebarMenuCatalogLoader();
        Map<String, List<SidebarMenuCatalogLoader.CatalogSubMenu>> catalog = loader.loadCatalog();
        for (var entry : catalog.entrySet()) {
            System.out.println("[" + entry.getKey() + "]");
            for (var item : entry.getValue()) {
                System.out.println("  " + item.slug() + " | " + item.name() + " | " + item.href());
            }
        }
    }
}
