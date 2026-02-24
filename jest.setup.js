import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder in Jest
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock scrollIntoView which is not available in Jest
Element.prototype.scrollIntoView = jest.fn()
