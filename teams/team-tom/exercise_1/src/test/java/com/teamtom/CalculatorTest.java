package com.teamtom;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    // add
    @Test
    void add_twoPositives_returnsSum() {
        assertEquals(5, calculator.add(2, 3));
    }

    @Test
    void add_negativeNumbers_returnsSum() {
        assertEquals(-5, calculator.add(-2, -3));
    }

    @Test
    void add_positiveAndNegative_returnsSum() {
        assertEquals(1, calculator.add(3, -2));
    }

    @Test
    void add_zeros_returnsZero() {
        assertEquals(0, calculator.add(0, 0));
    }

    // subtract
    @Test
    void subtract_twoPositives_returnsDifference() {
        assertEquals(1, calculator.subtract(3, 2));
    }

    @Test
    void subtract_resultNegative_returnsNegative() {
        assertEquals(-1, calculator.subtract(2, 3));
    }

    @Test
    void subtract_sameNumbers_returnsZero() {
        assertEquals(0, calculator.subtract(5, 5));
    }

    // multiply
    @Test
    void multiply_twoPositives_returnsProduct() {
        assertEquals(6, calculator.multiply(2, 3));
    }

    @Test
    void multiply_byZero_returnsZero() {
        assertEquals(0, calculator.multiply(5, 0));
    }

    @Test
    void multiply_negatives_returnsPositive() {
        assertEquals(6, calculator.multiply(-2, -3));
    }

    @Test
    void multiply_positiveAndNegative_returnsNegative() {
        assertEquals(-6, calculator.multiply(2, -3));
    }

    // divide
    @Test
    void divide_evenDivision_returnsExactResult() {
        assertEquals(2.0, calculator.divide(6, 3));
    }

    @Test
    void divide_unevenDivision_returnsDecimal() {
        assertEquals(2.5, calculator.divide(5, 2));
    }

    @Test
    void divide_numeratorZero_returnsZero() {
        assertEquals(0.0, calculator.divide(0, 5));
    }

    @Test
    void divide_negativeNumerator_returnsNegativeResult() {
        assertEquals(-2.0, calculator.divide(-6, 3));
    }

    @Test
    void divide_byZero_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> calculator.divide(5, 0));
    }

    @Test
    void divide_byZero_exceptionMessageMentionsDivideByZero() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class, () -> calculator.divide(1, 0));
        assertEquals("Cannot divide by zero", ex.getMessage());
    }
}
