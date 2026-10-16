package com.shivamdenge.userservice;

import com.shivamdenge.userservice.dto.UserDto;
import com.shivamdenge.userservice.entity.User;
import com.shivamdenge.userservice.exception.BadRequestException;
import com.shivamdenge.userservice.repository.UserRepository;
import com.shivamdenge.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private UserService userService;

    @Test
    void testSearchUsers_Success() {
        User user1 = new User();
        user1.setId(1L);
        user1.setName("John Doe");
        user1.setEmail("john@example.com");

        when(userRepository.findByNameContainingIgnoreCase("John")).thenReturn(List.of(user1));

        List<UserDto> results = userService.searchUsers("John");
        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getName());
    }

    @Test
    void testSearchUsers_EmptyQueryReturnsFallbackUsers() {
        User user1 = new User();
        user1.setId(1L);
        user1.setName("John Doe");

        when(userRepository.findAll()).thenReturn(List.of(user1));

        List<UserDto> results = userService.searchUsers("   ");
        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getName());
        verify(userRepository).findAll();
    }

    @Test
    void testGetEligibleUsers_Success() {
        User user1 = new User();
        user1.setId(1L);
        user1.setName("Alice");

        User user2 = new User();
        user2.setId(2L);
        user2.setName("Bob");

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        List<UserDto> eligible = userService.getEligibleUsers(1L);
        assertEquals(1, eligible.size());
        assertEquals("Bob", eligible.get(0).getName());
    }

    @Test
    void testGetUserById_Found() {
        User user = new User();
        user.setId(2L);
        user.setName("Alice");
        user.setEmail("alice@example.com");

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        UserDto dto = userService.getUserById(2L);
        assertEquals(2L, dto.getId());
        assertEquals("Alice", dto.getName());
    }

    @Test
    void testGetUserById_NotFoundThrows() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> userService.getUserById(99L));
    }
}
