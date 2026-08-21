package com.kantechsolution.smart_school.repository;

import com.kantechsolution.smart_school.model.AppUserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserAccountRepository extends JpaRepository<AppUserAccount, Long> {

    Optional<AppUserAccount> findByUserTypeAndSourceId(String userType, Long sourceId);

    List<AppUserAccount> findByUserTypeOrderByIdAsc(String userType);
}
